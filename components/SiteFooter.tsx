import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="footer-brand">
            asiance
          </Link>

          <p className="footer-tag">
            A modern circle for considerate living, slow commerce, and small rituals.
          </p>

          <form className="footer-newsletter">
            <input type="email" placeholder="your email" />
            <button type="button">Join</button>
          </form>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/community-news">Community News</Link>
          <Link href="/activity">Activity</Link>
          <Link href="/members">Members</Link>
        </div>

        <div className="footer-col">
          <h4>Community</h4>
          <Link href="/circles">Groups</Link>
          <Link href="/forums">Forums</Link>
          <Link href="/activity">Events</Link>
          <Link href="/members">Become a member</Link>
        </div>

        <div className="footer-col">
          <h4>Shop & Read</h4>
          <Link href="/shop">Shop</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/account">My account</Link>
          <Link href="/checkout">Checkout</Link>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <Link href="/contact">Contact</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/faq">FAQ</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Asiance</span>
        <span>Concept · UI/UX · Ready for handoff</span>
      </div>
    </footer>
  );
}