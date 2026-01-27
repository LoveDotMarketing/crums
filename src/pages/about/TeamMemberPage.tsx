import { useParams, Link, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter, 
  Facebook,
  Users,
  Star,
  Sparkles
} from "lucide-react";
import { teamMembers, getTeamMemberBySlug } from "@/lib/team";
import { generateBreadcrumbSchema } from "@/lib/structuredData";

const TeamMemberPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const member = getTeamMemberBySlug(slug || "");

  if (!member) {
    return <Navigate to="/about" replace />;
  }

  const currentIndex = teamMembers.findIndex(m => m.slug === slug);
  const prevMember = currentIndex > 0 ? teamMembers[currentIndex - 1] : null;
  const nextMember = currentIndex < teamMembers.length - 1 ? teamMembers[currentIndex + 1] : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://crumsleasing.com/" },
    { name: "About", url: "https://crumsleasing.com/about" },
    { name: member.name, url: `https://crumsleasing.com/about/${member.slug}` }
  ]);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.name,
    "jobTitle": member.title,
    "worksFor": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "description": member.bio[0]
  };

  const MemberIcon = member.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${member.name} - ${member.title} | CRUMS Leasing Team`}
        description={member.bio[0]}
        canonical={`https://crumsleasing.com/about/${member.slug}`}
        structuredData={[personSchema, breadcrumbSchema]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Avatar className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 border-4 border-primary-foreground/30 shadow-2xl">
              {member.headshot ? (
                <AvatarImage 
                  src={member.headshot} 
                  alt={`${member.name} - ${member.role}`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary-foreground/10">
                <MemberIcon className="h-20 w-20 text-primary-foreground/80" />
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="mb-4">
              {member.role}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {member.name}
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90">
              {member.title}
            </p>
          </div>
        </div>
      </section>

      <Breadcrumbs />

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Bio */}
            <div className="prose prose-lg max-w-none mb-12">
              {member.bio.map((paragraph, index) => (
                <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Contact & Social */}
            {(member.email || member.phone || member.socialLinks) && (
              <Card className="mb-12">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact {member.name}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {member.email && (
                      <a href={`mailto:${member.email}`}>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          {member.email}
                        </Button>
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          {member.phone}
                        </Button>
                      </a>
                    )}
                    {member.socialLinks?.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                      </a>
                    )}
                    {member.socialLinks?.facebook && (
                      <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Specialties */}
              {member.specialties && member.specialties.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-secondary" />
                      Specialties
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fun Facts */}
              {member.funFacts && member.funFacts.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      Fun Facts
                    </h2>
                    <ul className="space-y-2">
                      {member.funFacts.map((fact, index) => (
                        <li key={index} className="text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator className="my-8" />

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {prevMember ? (
                <Link to={`/about/${prevMember.slug}`} className="group flex-1">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div>
                        <p className="text-xs text-muted-foreground">Previous</p>
                        <p className="font-medium group-hover:text-primary transition-colors">{prevMember.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : <div className="flex-1" />}
              
              <Link to="/about" className="flex-shrink-0">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  All Team Members
                </Button>
              </Link>

              {nextMember ? (
                <Link to={`/about/${nextMember.slug}`} className="group flex-1">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center justify-end gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Next</p>
                        <p className="font-medium group-hover:text-primary transition-colors">{nextMember.name}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Ready to Work with Our Team?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Experience the CRUMS difference — where every carrier is treated like family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">
                Meet the Full Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TeamMemberPage;
