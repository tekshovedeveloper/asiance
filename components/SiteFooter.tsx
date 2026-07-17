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
          <Link href="/activity">Activity</Link>
          <Link href="/members">Members</Link>
        </div>

        <div className="footer-col">
          <h4>Community & Read</h4>
          <Link href="/community-news">Community News</Link>
          <Link href="/circles">Groups</Link>
           <Link href="/blog">Blog</Link>
        </div>

        <div className="footer-col">
          <h4>Shop & Read</h4>
          <Link href="/shop">Shop</Link>
           <Link href="/cart">Cart</Link>
            <Link href="/shipping">Shipping</Link>
          <Link href="/checkout">Checkout</Link>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <Link href="/contact">Contact</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Asiance</span>
        <span>Concept · UI/UX · Ready for handoff</span>
      </div>
    </footer>
  );
}
