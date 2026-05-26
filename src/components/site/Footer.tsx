export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">GB</span>
            Good Bookies
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Floodlit. Fast. Fully booked. Find and book your next match in seconds.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Sports</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Football</li>
            <li>Cricket</li>
            <li>Basketball</li>
            <li>Badminton</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Contact</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Good Bookies. All rights reserved.
      </div>
    </footer>
  );
}