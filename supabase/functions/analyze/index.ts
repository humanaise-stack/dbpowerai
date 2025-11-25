import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Free-Analysis-Token",
};

interface AnalysisRequest {
  query: string;
  schema?: string;
  explain?: string;
}

interface AnalysisResult {
  score: number;
  severity: "low" | "medium" | "high" | "critical";
  issues: string[];
  suggestedIndex: string;
  rewrittenQuery: string;
  speedupEstimate: number;
}

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip");

  return cfConnectingIP || forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown';
}

function fakeAnalysis(request: AnalysisRequest): AnalysisResult {
  const { query } = request;
  const queryLower = query.toLowerCase();

  const issues: string[] = [];
  let score = 85;
  let severity: "low" | "medium" | "high" | "critical" = "low";

  if (queryLower.includes("select *")) {
    issues.push("Using SELECT * retrieves unnecessary columns");
    score -= 15;
  }

  if (queryLower.includes("where") && !queryLower.includes("index")) {
    issues.push("Missing index on WHERE clause columns");
    score -= 20;
    severity = "high";
  }

  if (queryLower.includes("order by") && !queryLower.includes("limit")) {
    issues.push("ORDER BY without LIMIT can cause performance issues");
    score -= 10;
  }

  if (queryLower.includes("like '%")) {
    issues.push("Leading wildcard in LIKE prevents index usage");
    score -= 15;
    severity = "high";
  }

  if (queryLower.includes("or")) {
    issues.push("OR conditions may prevent index optimization");
    score -= 10;
  }

  if (
    queryLower.includes("join") &&
    !queryLower.includes("on") &&
    !queryLower.includes("using")
  ) {
    issues.push("JOIN without proper ON clause");
    score -= 25;
    severity = "critical";
  }

  if (queryLower.includes("subquery") || queryLower.match(/\(select/gi)) {
    issues.push("Subquery detected - consider using JOIN instead");
    score -= 12;
  }

  if (score < 40) {
    severity = "critical";
  } else if (score < 60) {
    severity = "high";
  } else if (score < 75) {
    severity = "medium";
  }

  const tableName =
    query.match(/from\s+(\w+)/i)?.[1] || "your_table";
  const whereColumn =
    query.match(/where\s+(\w+)/i)?.[1] || "status";

  const suggestedIndex = issues.some((i) =>
    i.includes("Missing index")
  )
    ? `CREATE INDEX idx_${tableName}_${whereColumn}\nON ${tableName}(${whereColumn});`
    : "";

  let rewrittenQuery = query.trim();

  if (queryLower.includes("select *")) {
    rewrittenQuery = rewrittenQuery.replace(
      /SELECT\s+\*/gi,
      "SELECT id, status, created_at"
    );
  }

  if (
    queryLower.includes("order by") &&
    !queryLower.includes("limit")
  ) {
    if (!rewrittenQuery.endsWith(";")) {
      rewrittenQuery += "\nLIMIT 100;";
    } else {
      rewrittenQuery = rewrittenQuery.replace(
        /;$/,
        "\nLIMIT 100;"
      );
    }
  }

  const speedupEstimate =
    issues.length > 0
      ? Math.min(0.9, 0.2 + issues.length * 0.15)
      : 0.1;

  return {
    score: Math.max(0, Math.min(100, score)),
    severity,
    issues:
      issues.length > 0
        ? issues
        : ["No major issues found"],
    suggestedIndex,
    rewrittenQuery,
    speedupEstimate,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    let isAuthenticated = false;

    if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      const freeToken = req.headers.get("X-Free-Analysis-Token");
      const clientIP = getClientIP(req);

      if (!freeToken) {
        return new Response(
          JSON.stringify({
            error: "no_free_token",
            message: "Create a free account to continue analyzing queries.",
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const { data: existingTokenByIP } = await supabaseAdmin
        .from("free_tokens")
        .select("token")
        .eq("ip_address", clientIP)
        .maybeSingle();

      if (existingTokenByIP) {
        return new Response(
          JSON.stringify({
            error: "free_limit_reached",
            message: "Your free analysis has been used. Please sign up for unlimited access.",
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const { data: existingToken } = await supabaseAdmin
        .from("free_tokens")
        .select("token")
        .eq("token", freeToken)
        .maybeSingle();

      if (existingToken) {
        return new Response(
          JSON.stringify({
            error: "free_limit_reached",
            message: "Your free analysis has been used. Please sign up for unlimited access.",
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const { error: insertError } = await supabaseAdmin
        .from("free_tokens")
        .insert({
          token: freeToken,
          ip_address: clientIP
        });

      if (insertError) {
        console.error("Error inserting free token:", insertError);
        return new Response(
          JSON.stringify({
            error: "server_error",
            message: "Unable to process request. Please try again.",
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    const body = await req.json();

    if (!body.query || typeof body.query !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid request: query is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const analysisRequest: AnalysisRequest = {
      query: body.query,
      schema: body.schema,
      explain: body.explain,
    };

    const result = fakeAnalysis(analysisRequest);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in analyze function:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
