import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black py-20 border-t border-black/10 dark:border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Difras
            </Link>
            <p className="mt-4 text-black/70 dark:text-white/70 leading-relaxed">
              Simplifying academic documentation with AI-powered tools designed
              for researchers.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 text-black dark:text-white">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 text-black dark:text-white">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 text-black dark:text-white">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-black/60 dark:text-white/60">
            © {new Date().getFullYear()} Difras. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
