import { Copy, Check, Lock, Globe, Server } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const BASE_URL = "https://deeeqatnqqfcxsccigyc.supabase.co/functions/v1";

interface EndpointProps {
  name: string;
  path: string;
  method: string;
  description: string;
  isProtected: boolean;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  exampleRequest: object;
  exampleResponse: object;
}

const CodeBlock = ({ code, language = "json" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const EndpointCard = ({ endpoint }: { endpoint: EndpointProps }) => (
  <Card className="mb-6">
    <CardHeader>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary" className="font-mono">POST</Badge>
        <CardTitle className="text-lg font-mono break-all">{endpoint.path}</CardTitle>
        {endpoint.isProtected ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Protected
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" /> Public
          </Badge>
        )}
      </div>
      <CardDescription className="mt-2">{endpoint.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Full URL</h4>
        <CodeBlock code={`${BASE_URL}/${endpoint.path}`} language="text" />
      </div>

      {endpoint.parameters.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Parameters</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Required</th>
                  <th className="text-left p-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((param) => (
                  <tr key={param.name} className="border-t">
                    <td className="p-3 font-mono text-primary">{param.name}</td>
                    <td className="p-3 font-mono text-muted-foreground">{param.type}</td>
                    <td className="p-3">
                      {param.required ? (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </td>
                    <td className="p-3">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Tabs defaultValue="request" className="w-full">
        <TabsList>
          <TabsTrigger value="request">Example Request</TabsTrigger>
          <TabsTrigger value="response">Example Response</TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          <CodeBlock code={JSON.stringify(endpoint.exampleRequest, null, 2)} />
        </TabsContent>
        <TabsContent value="response">
          <CodeBlock code={JSON.stringify(endpoint.exampleResponse, null, 2)} />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

const trailerEndpoints: EndpointProps[] = [
  {
    name: "List Trailers",
    path: "agent-trailers-list",
    method: "POST",
    description: "Retrieve a list of all trailers with optional filtering by type, status, or trailer number.",
    isProtected: false,
    parameters: [
      { name: "type", type: "string", required: false, description: "Filter by trailer type (e.g., 'Dry Van', 'Flatbed')" },
      { name: "status", type: "string", required: false, description: "Filter by status ('available', 'rented', 'maintenance')" },
      { name: "trailer_number", type: "string", required: false, description: "Search by trailer number (partial match)" },
    ],
    exampleRequest: { type: "Dry Van", status: "available" },
    exampleResponse: {
      trailers: [
        { id: "uuid", trailer_number: "CRUMS-001", type: "Dry Van", year: 2022, make: "Utility", model: "4000D-X", status: "available", is_rented: false }
      ],
      count: 1
    }
  },
  {
    name: "Available Trailers",
    path: "agent-trailers-available",
    method: "POST",
    description: "Get only available (not rented, not in maintenance) trailers, optionally filtered by type.",
    isProtected: false,
    parameters: [
      { name: "type", type: "string", required: false, description: "Filter by trailer type" },
    ],
    exampleRequest: { type: "Flatbed" },
    exampleResponse: {
      available_trailers: [
        { id: "uuid", trailer_number: "CRUMS-015", type: "Flatbed", year: 2021, make: "Great Dane", status: "available" }
      ],
      count: 1
    }
  },
  {
    name: "Trailer Statistics",
    path: "agent-trailers-stats",
    method: "POST",
    description: "Get aggregate statistics about the trailer fleet including counts by status and type.",
    isProtected: false,
    parameters: [],
    exampleRequest: {},
    exampleResponse: {
      total: 49,
      available: 18,
      rented: 31,
      maintenance: 0,
      by_type: { "Dry Van": 35, "Flatbed": 14 },
      by_status: { available: 18, rented: 31, maintenance: 0 }
    }
  },
  {
    name: "Get Single Trailer",
    path: "agent-trailers-get",
    method: "POST",
    description: "Retrieve detailed information about a specific trailer by ID or trailer number.",
    isProtected: false,
    parameters: [
      { name: "trailer_id", type: "string (UUID)", required: false, description: "The unique trailer ID" },
      { name: "trailer_number", type: "string", required: false, description: "The trailer number (e.g., 'CRUMS-001')" },
    ],
    exampleRequest: { trailer_number: "CRUMS-001" },
    exampleResponse: {
      trailer: {
        id: "uuid",
        trailer_number: "CRUMS-001",
        type: "Dry Van",
        year: 2022,
        make: "Utility",
        model: "4000D-X",
        status: "available",
        is_rented: false,
        license_plate: "TX-12345",
        notes: "Recently serviced"
      }
    }
  },
];

const customerEndpoints: EndpointProps[] = [
  {
    name: "Search Customers",
    path: "agent-customers-search",
    method: "POST",
    description: "Search for customers by email or name. Returns matching customer profiles.",
    isProtected: true,
    parameters: [
      { name: "email", type: "string", required: false, description: "Search by email address (partial match)" },
      { name: "name", type: "string", required: false, description: "Search by first name, last name, or company name" },
    ],
    exampleRequest: { email: "john@example.com" },
    exampleResponse: {
      customers: [
        { id: "uuid", email: "john@example.com", first_name: "John", last_name: "Doe", company_name: "Doe Trucking" }
      ],
      count: 1
    }
  },
  {
    name: "Get Customer Profile",
    path: "agent-customers-profile",
    method: "POST",
    description: "Retrieve detailed profile information for a specific customer.",
    isProtected: true,
    parameters: [
      { name: "customer_id", type: "string (UUID)", required: false, description: "The customer's unique ID" },
      { name: "email", type: "string", required: false, description: "The customer's email address" },
    ],
    exampleRequest: { customer_id: "uuid-here" },
    exampleResponse: {
      customer: {
        id: "uuid",
        email: "john@example.com",
        first_name: "John",
        last_name: "Doe",
        company_name: "Doe Trucking",
        phone: "555-123-4567",
        created_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    name: "Customer Applications",
    path: "agent-customers-applications",
    method: "POST",
    description: "Retrieve rental applications, optionally filtered by customer or status.",
    isProtected: true,
    parameters: [
      { name: "customer_id", type: "string (UUID)", required: false, description: "Filter by customer ID" },
      { name: "status", type: "string", required: false, description: "Filter by status ('pending', 'approved', 'rejected')" },
    ],
    exampleRequest: { status: "pending" },
    exampleResponse: {
      applications: [
        {
          id: "uuid",
          user_id: "uuid",
          status: "pending",
          phone_number: "555-123-4567",
          mc_dot_number: "MC123456",
          business_type: "Owner Operator",
          number_of_trailers: 2,
          created_at: "2024-01-20T14:00:00Z"
        }
      ],
      count: 1
    }
  },
  {
    name: "Customer Rentals",
    path: "agent-customers-rentals",
    method: "POST",
    description: "Get all trailers currently rented by a specific customer.",
    isProtected: true,
    parameters: [
      { name: "customer_id", type: "string (UUID)", required: true, description: "The customer's unique ID" },
    ],
    exampleRequest: { customer_id: "uuid-here" },
    exampleResponse: {
      rentals: [
        { id: "uuid", trailer_number: "CRUMS-005", type: "Dry Van", status: "rented", is_rented: true }
      ],
      count: 1
    }
  },
  {
    name: "Customer Tolls",
    path: "agent-customers-tolls",
    method: "POST",
    description: "Retrieve toll records for a specific customer with summary statistics.",
    isProtected: true,
    parameters: [
      { name: "customer_id", type: "string (UUID)", required: true, description: "The customer's unique ID" },
      { name: "status", type: "string", required: false, description: "Filter by toll status ('pending', 'paid')" },
    ],
    exampleRequest: { customer_id: "uuid-here", status: "pending" },
    exampleResponse: {
      tolls: [
        { id: "uuid", amount: 15.50, toll_date: "2024-01-18", toll_location: "TX Turnpike", status: "pending" }
      ],
      summary: {
        total_count: 5,
        total_amount: "$75.25",
        pending_amount: "$45.00",
        paid_amount: "$30.25",
        pending_count: 3,
        paid_count: 2
      }
    }
  },
];

const ApiDocs = () => {
  return (
    <>
      <SEO
        title="API Documentation"
        description="Complete API documentation for CRUMS Leasing n8n agent endpoints"
        canonical="https://crumsleasing.com/api-docs"
        noindex
      />
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-12 px-4">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Server className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">CRUMS Leasing API</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-4">
              n8n Agent Endpoint Documentation
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Version: 1.0.0</span>
              <span>•</span>
              <span>Last Updated: December 2, 2025</span>
            </div>
          </div>

          {/* Base URL */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={BASE_URL} language="text" />
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Some endpoints require authentication using a Bearer token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Public Endpoints</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trailer endpoints are publicly accessible and do not require authentication.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold">Protected Endpoints</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer endpoints require the <code className="bg-muted px-1 rounded">N8N_AGENT_SECRET</code> token.
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Authorization Header Format</h4>
                <CodeBlock code={`Authorization: Bearer YOUR_N8N_AGENT_SECRET`} language="text" />
              </div>
            </CardContent>
          </Card>

          {/* Error Codes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Error Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Code</th>
                      <th className="text-left p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3 font-mono">400</td>
                      <td className="p-3">Bad Request - Missing required parameters</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-mono">401</td>
                      <td className="p-3">Unauthorized - Invalid or missing authentication token</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-mono">404</td>
                      <td className="p-3">Not Found - Resource does not exist</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 font-mono">500</td>
                      <td className="p-3">Internal Server Error - Something went wrong</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Trailer Endpoints */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-500" />
              Trailer Endpoints (Public)
            </h2>
            {trailerEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.path} endpoint={endpoint} />
            ))}
          </div>

          {/* Customer Endpoints */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="h-6 w-6 text-destructive" />
              Customer Endpoints (Protected)
            </h2>
            {customerEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.path} endpoint={endpoint} />
            ))}
          </div>

          {/* n8n Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>n8n Configuration Guide</CardTitle>
              <CardDescription>How to set up these endpoints as tools in n8n</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Create HTTP Request Credentials</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For protected endpoints, create a "Header Auth" credential in n8n:
                </p>
                <CodeBlock code={`Name: Authorization\nValue: Bearer YOUR_N8N_AGENT_SECRET`} language="text" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Configure HTTP Request Node</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Method: POST</li>
                  <li>URL: {BASE_URL}/[endpoint-name]</li>
                  <li>Body Content Type: JSON</li>
                  <li>For protected endpoints: Add the Header Auth credential</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Example n8n Tool Configuration</h4>
                <CodeBlock
                  code={`{
  "name": "get_available_trailers",
  "description": "Get list of available trailers for rent",
  "url": "${BASE_URL}/agent-trailers-available",
  "method": "POST",
  "body": {
    "type": "{{ $json.trailer_type }}"
  }
}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>© 2025 CRUMS Leasing. All rights reserved.</p>
            <p className="mt-1">For support, call <a href="tel:+18885704564" className="text-primary hover:underline">(888) 570-4564</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApiDocs;
