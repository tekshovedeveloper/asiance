export function ProductAdminNotices({ status }: { status: string }) {
  return (
    <div className="wp-admin-notices product-admin-notices">
      <div className="notice notice-success">
        Meta for WooCommerce - 3.6.3 is untested with WordPress 7.0.
        <button type="button">× Dismiss</button>
      </div>
      <div className="notice notice-offer">
        <strong>82% OFF</strong>
        <span>
          <b>Limited Time Offer!</b>
          <br />
          Save up to $3,605 on the All-in-One WordPress Plugin Bundle (82% OFF)
        </span>
        <button type="button">Save $3,605 Now!</button>
      </div>
      {status ? <div className="notice notice-info">{status}</div> : null}
    </div>
  );
}
