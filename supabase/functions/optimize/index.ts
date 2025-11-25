import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { parseSql } from './parseSql.ts';
import { detectPatterns } from './detectPatterns.ts';
import { buildPrompt } from './buildPrompt.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OptimizeRequest {
  query: string;
  db: string;
  schema?: string;
  executionPlan?: string;
}

interface AdvisorResult {
  analysis: string;
  warnings: string[];
  rewrittenQuery: string;
  recommendedIndexes: string;
  notes: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { query, db, schema, executionPlan }: OptimizeRequest = await req.json();

    if (!query || !query.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!db || !db.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Database type is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[SQL Advisor] Analyzing query for user ${user.id}, database: ${db}`);

    const structure = parseSql(query);
    console.log('[SQL Advisor] Structure:', JSON.stringify(structure, null, 2));

    const patterns = detectPatterns(structure);
    console.log('[SQL Advisor] Patterns detected:', patterns.length);

    const advisorPrompt = buildPrompt({ query, db, structure, patterns, schema, executionPlan });
    console.log('[SQL Advisor] Prompt built, calling OpenAI...');

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: advisorPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to analyze query" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const resultText = openaiData.choices[0].message.content;
    console.log('[SQL Advisor] OpenAI response received');

    let result: AdvisorResult;
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      console.error('[SQL Advisor] Failed to parse OpenAI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid AI response format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const warningsJson = JSON.stringify(result.warnings || []);
    const patternsJson = JSON.stringify(patterns || []);

    console.log('[SQL Advisor] Saving to database...');

    const { data: queryRecord, error: insertError } = await supabase
      .from("queries")
      .insert({
        user_id: user.id,
        raw_query: query,
        optimized_query: result.rewrittenQuery,
        suggested_indexes: result.recommendedIndexes,
        bottleneck: patterns.map(p => p.message).join('; ') || 'No major issues detected',
        analysis: result.analysis,
        warnings: warningsJson,
        detected_patterns: patternsJson,
        db_type: db,
        notes: result.notes,
        schema: schema || null,
        execution_plan: executionPlan || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save query" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[SQL Advisor] Analysis complete and saved');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: queryRecord.id,
          analysis: result.analysis,
          warnings: result.warnings,
          rewrittenQuery: result.rewrittenQuery,
          recommendedIndexes: result.recommendedIndexes,
          notes: result.notes,
          detectedPatterns: patterns,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
