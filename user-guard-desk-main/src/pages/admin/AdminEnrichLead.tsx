import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeadInfo {
  Name: string;
  University: string;
  linkedin: string;
}

interface EnrichmentResult {
  linkedin: string;
  companyLinkedin: string;
  confidence_score: number | null;
}

export default function AdminEnrichLead() {
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({ 
    Name: "", 
    University: "", 
    linkedin: "" 
  });
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadInfo({ ...leadInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('enrich-lead', {
        body: { leadInfo },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setResult(data);
      toast({
        title: "Lead enrichment completed",
        description: "Successfully enriched lead information.",
      });
    } catch (error) {
      console.error('Error enriching lead:', error);
      toast({
        title: "Enrichment failed",
        description: "Failed to enrich lead information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setLeadInfo({ Name: "", University: "", linkedin: "" });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-admin-primary/10 rounded-lg">
          <User className="h-6 w-6 text-admin-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Enrichment</h1>
          <p className="text-muted-foreground">
            Enrich lead information with LinkedIn profiles and company data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lead Information
            </CardTitle>
            <CardDescription>
              Enter the available information about the lead to enrich their profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Name">Name *</Label>
                <Input
                  id="Name"
                  name="Name"
                  value={leadInfo.Name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="University">University</Label>
                <Input
                  id="University"
                  name="University"
                  value={leadInfo.University}
                  onChange={handleChange}
                  placeholder="Enter university name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={leadInfo.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || !leadInfo.Name.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Enrich Lead
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearForm}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Enrichment Results</CardTitle>
            <CardDescription>
              LinkedIn profiles and confidence score from SixtyFour AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">LinkedIn Profile</TableCell>
                      <TableCell>
                        {result.linkedin ? (
                          <a
                            href={result.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-admin-primary hover:underline"
                          >
                            View Profile
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Company LinkedIn</TableCell>
                      <TableCell>
                        {result.companyLinkedin ? (
                          <a
                            href={result.companyLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-admin-primary hover:underline"
                          >
                            View Company
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Confidence Score</TableCell>
                      <TableCell>
                         {result.confidence_score !== null ? (
                           <div className="flex items-center gap-2">
                             <span className="font-mono">
                               {result.confidence_score.toFixed(1)}%
                             </span>
                             <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-admin-primary transition-all duration-300"
                                 style={{ width: `${Math.min(result.confidence_score, 100)}%` }}
                               />
                             </div>
                           </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {result.linkedin && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      ✓ Successfully enriched lead with LinkedIn data
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Enter lead information and click "Enrich Lead" to see results</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}