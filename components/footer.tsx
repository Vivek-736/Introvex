import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white py-20 border-t border-black/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Difras
            </Link>
            <p className="mt-4 text-black/70 leading-relaxed">
              Simplifying academic documentation with AI-powered tools designed
              for researchers.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-black/60">
            © {new Date().getFullYear()} Difras. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-black/60 hover:text-black transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-black/60 hover:text-black transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="text-black/60 hover:text-black transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
