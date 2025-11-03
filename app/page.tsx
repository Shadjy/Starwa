import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Briefcase, MessageSquare, TrendingUp, Shield, Zap, Target, Award, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-[#f0dfc8] bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d4a574] to-[#e8b86d] bg-clip-text text-transparent">
              TalentMatch
            </h1>
          </div>
          <nav className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[#3d2f1f] hover:bg-[#f5e6d3] font-semibold">
                Inloggen
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-semibold shadow-md">
                Gratis starten
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="gradient-bg py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#f0dfc8] mb-8 shadow-md">
              <Sparkles className="w-5 h-5 text-[#d4a574]" />
              <span className="text-[#3d2f1f] font-semibold">AI-gedreven matching platform</span>
            </div>
            <h2 className="text-6xl font-bold text-[#3d2f1f] mb-6 text-balance leading-tight">
              Vind de perfecte match tussen{" "}
              <span className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] bg-clip-text text-transparent">
                talent en werkgever
              </span>
            </h2>
            <p className="text-2xl text-[#8b7355] mb-10 max-w-3xl mx-auto text-pretty leading-relaxed">
              TalentMatch verbindt werkgevers met de beste kandidaten en helpt werkzoekers hun droombaan te vinden met
              slimme AI-algoritmes.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold text-lg px-8 py-7 shadow-xl hover:shadow-2xl transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start nu gratis
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#f5e6d3] font-bold text-lg px-8 py-7 bg-transparent"
                >
                  Ontdek meer
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
                <div className="text-4xl font-bold text-[#d4a574] mb-2">10K+</div>
                <div className="text-[#8b7355] font-medium">Actieve gebruikers</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
                <div className="text-4xl font-bold text-[#d4a574] mb-2">5K+</div>
                <div className="text-[#8b7355] font-medium">Vacatures</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
                <div className="text-4xl font-bold text-[#d4a574] mb-2">95%</div>
                <div className="text-[#8b7355] font-medium">Match score</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-5xl font-bold text-[#3d2f1f] mb-4">Waarom TalentMatch?</h3>
              <p className="text-xl text-[#8b7355] max-w-2xl mx-auto">
                Ontdek hoe onze AI-gedreven platform jou helpt de perfecte match te vinden
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">AI-Matching</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  Slimme algoritmes matchen kandidaten en vacatures op basis van skills, ervaring en cultuurfit.
                </p>
              </div>

              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">Gepersonaliseerd</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  Ontvang aanbevelingen die perfect passen bij jouw profiel, voorkeuren en doelen.
                </p>
              </div>

              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">Direct Contact</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  Communiceer direct met werkgevers of kandidaten via ons ingebouwde berichtencentrum.
                </p>
              </div>

              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">Veilig & Privacy</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  GDPR-compliant en versleutelde data. Jouw privacy staat bij ons voorop.
                </p>
              </div>

              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">Groei & Ontwikkeling</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  Volg je voortgang en ontwikkel je skills met onze tools en aanbevelingen.
                </p>
              </div>

              <div className="p-8 border-2 border-[#f0dfc8] rounded-2xl bg-gradient-to-br from-white to-[#fffbf5] card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[#3d2f1f]">Kwaliteit</h4>
                <p className="text-[#8b7355] leading-relaxed">
                  Alleen geverifieerde bedrijven en gekwalificeerde kandidaten op ons platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Employers and Job Seekers */}
        <section className="gradient-bg py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-5xl font-bold text-center mb-16 text-[#3d2f1f]">Voor werkgevers en werkzoekers</h3>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="bg-white p-10 border-2 border-[#f0dfc8] rounded-2xl shadow-xl card-hover">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#3d2f1f]">Voor Werkgevers</h4>
                </div>
                <ul className="space-y-4 text-[#8b7355] text-lg">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Vind de beste kandidaten met AI-matching</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Beheer vacatures eenvoudig in één dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Direct contact met talent via berichtencentrum</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Inzicht in kandidaat skills en motivatie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Bespaar tijd met slimme voorselectie</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-8">
                  <Button className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 text-lg shadow-lg">
                    Start als werkgever
                  </Button>
                </Link>
              </div>

              <div className="bg-white p-10 border-2 border-[#f0dfc8] rounded-2xl shadow-xl card-hover">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#3d2f1f]">Voor Werkzoekers</h4>
                </div>
                <ul className="space-y-4 text-[#8b7355] text-lg">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Ontdek passende vacatures met AI-aanbevelingen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Bouw je profiel op met skills en ervaring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Ontvang persoonlijke matches op basis van fit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Communiceer direct met werkgevers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#9bc49f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Volg je sollicitaties en voortgang</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-8">
                  <Button className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 text-lg shadow-lg">
                    Start als werkzoeker
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] py-20">
          <div className="container mx-auto px-4 text-center">
            <Heart className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-5xl font-bold text-white mb-6">Klaar om te beginnen?</h3>
            <p className="text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Sluit je aan bij duizenden tevreden gebruikers en vind vandaag nog je perfecte match!
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#d4a574] hover:bg-[#fffbf5] font-bold text-xl px-12 py-8 shadow-2xl hover:shadow-3xl transition-all"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Gratis account aanmaken
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#f0dfc8] bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#3d2f1f]">TalentMatch</h3>
              </div>
              <p className="text-[#8b7355]">AI-gedreven matching platform voor talent en werkgevers.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#3d2f1f] mb-4">Platform</h4>
              <ul className="space-y-2 text-[#8b7355]">
                <li>
                  <Link href="/register" className="hover:text-[#d4a574]">
                    Registreren
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#d4a574]">
                    Inloggen
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#3d2f1f] mb-4">Bedrijf</h4>
              <ul className="space-y-2 text-[#8b7355]">
                <li>
                  <a href="#" className="hover:text-[#d4a574]">
                    Over ons
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4a574]">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#3d2f1f] mb-4">Juridisch</h4>
              <ul className="space-y-2 text-[#8b7355]">
                <li>
                  <a href="#" className="hover:text-[#d4a574]">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4a574]">
                    Voorwaarden
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-[#f0dfc8] pt-8 text-center text-[#8b7355]">
            <p>&copy; 2025 TalentMatch. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
