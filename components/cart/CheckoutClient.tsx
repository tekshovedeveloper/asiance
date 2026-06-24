'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Country, State } from 'country-state-city';
import { API_URL } from '@/lib/api';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

type CartItem = {
  slug: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CheckoutErrors = {
  billingPostcode?: string;
  shippingPostcode?: string;
  billingState?: string;
  shippingState?: string;
};

const CART_KEY = 'asiance_cart';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function validatePostalCode(countryCode: string, postalCode: string) {
  const value = postalCode.trim();

  if (!value) {
    return 'ZIP / postal code is required.';
  }

  const rules: Record<string, { pattern: RegExp; example: string }> = {
    US: {
      pattern: /^\d{5}(-\d{4})?$/,
      example: '12345 or 12345-6789',
    },
    PK: {
      pattern: /^\d{5}$/,
      example: '54000',
    },
    GB: {
      pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
      example: 'SW1A 1AA',
    },
    CA: {
      pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
      example: 'K1A 0B1',
    },
    AE: {
      pattern: /^.{0,20}$/,
      example: 'optional / area code',
    },
    SA: {
      pattern: /^\d{5}$/,
      example: '11564',
    },
    IN: {
      pattern: /^\d{6}$/,
      example: '110001',
    },
    AU: {
      pattern: /^\d{4}$/,
      example: '2000',
    },
    DE: {
      pattern: /^\d{5}$/,
      example: '10115',
    },
    FR: {
      pattern: /^\d{5}$/,
      example: '75001',
    },
  };

  const rule = rules[countryCode];

  if (!rule) {
    return '';
  }

  if (!rule.pattern.test(value)) {
    return `Invalid ZIP / postal code for selected country. Example: ${rule.example}`;
  }

  return '';
}

export function CheckoutClient() {
  const router = useRouter();

  const countries = useMemo(() => Country.getAllCountries(), []);

  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [userEmail, setUserEmail] = useState('');
  const [showLoginToast, setShowLoginToast] = useState(false);
  const shipDifferent = false;

  const [billingCountry, setBillingCountry] = useState('US');
  const [billingState, setBillingState] = useState('');
  const [billingPostcode, setBillingPostcode] = useState('');

  const [shippingCountry, setShippingCountry] = useState('US');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostcode, setShippingPostcode] = useState('');

  const [shippingOptions, setShippingOptions] = useState<{ id: string; title: string; type: string; cost: number }[]>([]);
const [shippingCost, setShippingCost] = useState(0);

  const billingStates = useMemo(
    () => State.getStatesOfCountry(billingCountry),
    [billingCountry],
  );

  const shippingStates = useMemo(
    () => State.getStatesOfCountry(shippingCountry),
    [shippingCountry],
  );

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'));
    const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
    if (token) {
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : null)
        .then((me) => { if (me?.email) setUserEmail(me.email); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    setBillingState('');
    setBillingPostcode('');
  }, [billingCountry]);

  useEffect(() => {
    setShippingState('');
    setShippingPostcode('');
  }, [shippingCountry]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [items],
  );

  const shipping = items.length ? shippingCost : 0;
const total = subtotal + shipping;

  function validateCheckout() {
    const nextErrors: CheckoutErrors = {};

    if (billingStates.length && !billingState) {
      nextErrors.billingState = 'Please select a valid state for billing country.';
    }

    const billingZipError = validatePostalCode(billingCountry, billingPostcode);
    if (billingZipError) {
      nextErrors.billingPostcode = billingZipError;
    }

    if (shipDifferent) {
      if (shippingStates.length && !shippingState) {
        nextErrors.shippingState = 'Please select a valid state for shipping country.';
      }

      const shippingZipError = validatePostalCode(shippingCountry, shippingPostcode);
      if (shippingZipError) {
        nextErrors.shippingPostcode = shippingZipError;
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  const regionName = useMemo(() => {
    return countries.find((c) => c.isoCode === billingCountry)?.name ?? 'everywhere';
  }, [billingCountry, countries]);


  useEffect(() => {
    async function loadShipping() {
      if (!items.length) {
        setShippingOptions([]);
        setShippingCost(0);
        return;
      }

      console.log('subtotal:', subtotal);
console.log('billingCountry:', billingCountry);
console.log('regionName:', regionName);
  
      const res = await fetch(
        `${API_URL}/shop/shipping/options?total=${encodeURIComponent(String(subtotal))}&region=${encodeURIComponent(regionName)}`,
      );
  
      const data = await res.json().catch(() => []);
      const options = Array.isArray(data) ? data : [];
  
      setShippingOptions(options);
  
      // pick first option (or you can choose cheapest, etc.)
      setShippingCost(options[0]?.cost ?? 0);
    }
  
    loadShipping();
  }, [items.length, subtotal, regionName]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
    if (!token) {
      setShowLoginToast(true);
      return;
    }

    setStatus('');

    if (!validateCheckout()) {
      setStatus('Please resolve the highlighted checkout issues before placing your order.');
      return;
    }

    const form = new FormData(event.currentTarget);

    const billingCountryName =
      countries.find((country) => country.isoCode === billingCountry)?.name ?? billingCountry;

    const shippingCountryName =
      countries.find((country) => country.isoCode === shippingCountry)?.name ?? shippingCountry;

    const fullName = `${String(form.get('firstName') || '')} ${String(
      form.get('lastName') || '',
    )}`.trim();

    const address = [
      String(form.get('address1') || ''),
      String(form.get('address2') || ''),
      String(form.get('city') || ''),
      billingState,
      billingPostcode,
      billingCountryName,
      String(form.get('phone') || ''),
      String(form.get('notes') || ''),
    ]
      .filter(Boolean)
      .join(', ');

    // const shippingAddress = shipDifferent
    //   ? [
    //       String(form.get('shippingAddress1') || ''),
    //       String(form.get('shippingAddress2') || ''),
    //       String(form.get('shippingCity') || ''),
    //       shippingState,
    //       shippingPostcode,
    //       shippingCountryName,
    //       String(form.get('shippingPhone') || ''),
    //     ]
    //       .filter(Boolean)
    //       .join(', ')
    //   : address;

    const shippingAddress = address;


    const payload = {
      email: String(form.get('email')),
      name: fullName,
      phone: String(form.get('phone') || ''),
      address,
      shippingAddress,
      shipping: shippingCost,
      items,
    };

   try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
  const response = await fetch(`${API_URL}/shop/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Order failed');

  const order = await response.json().catch(() => null);

  localStorage.removeItem(CART_KEY);
  setItems([]);

  if (order?._id || order?.id) {
    localStorage.setItem(
      'asiance_last_order',
      JSON.stringify({
        id: order._id ?? order.id,
        subtotal,
        shipping,   // the shipping you calculated on checkout
        total,
        items,
        name: fullName,
        email: String(form.get('email')),
        address,    // billing address string you already build
      }),
    );
  } else {
    localStorage.setItem(
      'asiance_last_order',
      JSON.stringify({
        subtotal,
        shipping,   // the shipping you calculated on checkout
        total,
        items,
        name: fullName,
        email: String(form.get('email')),
        address,
      }),
    );
  }

  router.push('/thank-you');
} catch {
  setStatus('The API is offline. Start the Nest server and MongoDB, then submit again.');
}
  }

  return (
    <section className={styles.checkoutWrap}>
      <h1 className={styles.checkoutTitle}>Checkout</h1>

      <div className={styles.noticeBox}>
        <span className={styles.blueSquareIcon} />
        <span>
          Returning customer? <button type="button" onClick={() => router.push('/login?redirect=/checkout')}>Click here to login</button>
        </span>
      </div>

      <div className={styles.noticeBox}>
        <span className={styles.blueSquareIcon} />
        <span>
          Have a coupon? <button type="button">Click here to enter your code</button>
        </span>
      </div>

      {status ? (
        <div className={Object.keys(errors).length ? styles.errorNotice : styles.successNotice}>
          {status}
        </div>
      ) : null}

      <form className={styles.checkoutGrid} onSubmit={submit}>
        <section className={styles.billingPanel}>
          <div className={styles.zoneNotice}>
            <span className={styles.checkCircle}>✓</span>
            <span>
              Customer selected zone &quot;
              {countries.find((country) => country.isoCode === billingCountry)?.name ?? billingCountry}
              &quot;
            </span>
          </div>

          <h2>Contact information</h2>
          <div className={styles.checkoutLine} />

          <label>
            Email address <span>*</span>
            <input name="email" type="email" required key={userEmail} defaultValue={userEmail} />
          </label>

          <h2>Billing details</h2>
          <div className={styles.checkoutLine} />

          <div className={styles.twoCols}>
            <label>
              First name <span>*</span>
              <input name="firstName" required />
            </label>

            <label>
              Last name <span>*</span>
              <input name="lastName" required />
            </label>
          </div>

          <label>
            Company name <small>(optional)</small>
            <input name="company" />
          </label>

          <label>
            Country / Region <span>*</span>
            <select
              name="country"
              value={billingCountry}
              onChange={(event) => setBillingCountry(event.target.value)}
              required
            >
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Street address <span>*</span>
            <input name="address1" placeholder="House number and street name" required />
            <input name="address2" placeholder="Apartment, suite, unit, etc. (optional)" />
          </label>

          <label>
            Town / City <span>*</span>
            <input name="city" required />
          </label>

          <label>
            State <span>*</span>
            {billingStates.length ? (
              <select
                name="state"
                value={billingState}
                onChange={(event) => setBillingState(event.target.value)}
                required
                className={errors.billingState ? styles.fieldError : ''}
              >
                <option value="">Select state</option>
                {billingStates.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="state"
                value={billingState}
                onChange={(event) => setBillingState(event.target.value)}
                placeholder="State / Province"
                required
                className={errors.billingState ? styles.fieldError : ''}
              />
            )}
            {errors.billingState ? (
              <small className={styles.errorText}>{errors.billingState}</small>
            ) : null}
          </label>

          <label>
            ZIP Code <span>*</span>
            <input
              name="postcode"
              value={billingPostcode}
              onChange={(event) => setBillingPostcode(event.target.value)}
              required
              className={errors.billingPostcode ? styles.fieldError : ''}
            />
            {errors.billingPostcode ? (
              <small className={styles.errorText}>{errors.billingPostcode}</small>
            ) : null}
          </label>

          <label>
            Phone <span>*</span>
            <input name="phone" required />
          </label>

          {/* <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={shipDifferent}
              onChange={(event) => setShipDifferent(event.target.checked)}
            />
            <span>Ship to a different address?</span>
          </label> */}

          {/* {shipDifferent ? (
            <div className={styles.shippingBlock}>
              <div className={styles.checkoutLine} />

              <div className={styles.twoCols}>
                <label>
                  First name <span>*</span>
                  <input name="shippingFirstName" />
                </label>

                <label>
                  Last name <span>*</span>
                  <input name="shippingLastName" />
                </label>
              </div>

              <label>
                Company name <small>(optional)</small>
                <input name="shippingCompany" />
              </label>

              <label>
                Country / Region <span>*</span>
                <select
                  name="shippingCountry"
                  value={shippingCountry}
                  onChange={(event) => setShippingCountry(event.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Street address <span>*</span>
                <input name="shippingAddress1" placeholder="House number and street name" />
                <input name="shippingAddress2" placeholder="Apartment, suite, unit, etc. (optional)" />
              </label>

              <label>
                Town / City <span>*</span>
                <input name="shippingCity" />
              </label>

              <label>
                State <span>*</span>
                {shippingStates.length ? (
                  <select
                    name="shippingState"
                    value={shippingState}
                    onChange={(event) => setShippingState(event.target.value)}
                    className={errors.shippingState ? styles.fieldError : ''}
                  >
                    <option value="">Select state</option>
                    {shippingStates.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="shippingState"
                    value={shippingState}
                    onChange={(event) => setShippingState(event.target.value)}
                    placeholder="State / Province"
                    className={errors.shippingState ? styles.fieldError : ''}
                  />
                )}
                {errors.shippingState ? (
                  <small className={styles.errorText}>{errors.shippingState}</small>
                ) : null}
              </label>

              <label>
                ZIP Code <span>*</span>
                <input
                  name="shippingPostcode"
                  value={shippingPostcode}
                  onChange={(event) => setShippingPostcode(event.target.value)}
                  className={errors.shippingPostcode ? styles.fieldError : ''}
                />
                {errors.shippingPostcode ? (
                  <small className={styles.errorText}>{errors.shippingPostcode}</small>
                ) : null}
              </label>

              <label>
                Phone <span>*</span>
                <input name="shippingPhone" />
              </label>
            </div>
          ) : null} */}

          <div className={styles.additionalInfo}>
            <label>
              Order notes <small>(optional)</small>
              <textarea
                name="notes"
                rows={4}
                placeholder="Notes about your order, e.g. special notes for delivery."
              />
            </label>
          </div>
        </section>

        <aside className={styles.orderBox}>
          <h2>Your order</h2>

          <div className={styles.orderTable}>
            <div className={styles.orderHead}>
              <strong>Product</strong>
              <strong>Subtotal</strong>
            </div>

            {items.length ? (
              items.map((item, index) => (
                <div className={styles.orderRow} key={`${item.slug}-${index}`}>
                  <span>
                    {item.name}
                    <br />× {item.quantity || 1}
                  </span>
                  <span>{money(Number(item.price || 0) * Number(item.quantity || 1))}</span>
                </div>
              ))
            ) : (
              <div className={styles.orderRow}>
                <span>Your bag is empty</span>
                <span>{money(0)}</span>
              </div>
            )}

            <div className={styles.orderRow}>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className={styles.orderRow}>
  <span>Shipment</span>
  <span>
    {shippingOptions.length ? (
      <>
        {shippingOptions[0].title}
        <br />
        <strong>{money(shipping)}</strong>
      </>
    ) : (
      <>
        No shipping options
        <br />
        <strong>{money(0)}</strong>
      </>
    )}
  </span>
</div>

            <div className={`${styles.orderRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <div className={styles.payLater}>
            Pay in 4 interest-free payments of {money(total / 4)} with{' '}
            <strong>PayPal</strong>. <button type="button">Learn more</button>
          </div>

          <div className={styles.paymentMethods}>
            <label className={styles.paymentRadio}>
              <input type="radio" name="paymentMethod" defaultChecked />
              <span>Card</span>
              <span className={styles.cardBadges}>
                <b>VISA</b>
                <b>MC</b>
                <b>AMEX</b>
                <b>+3</b>
              </span>
            </label>

            <div className={styles.cardBox}>
              <label>
                Card number
                <input placeholder="1234 1234 1234 1234" disabled />
              </label>

              <div className={styles.cardTwoCols}>
                <label>
                  Expiration date
                  <input placeholder="MM / YY" disabled />
                </label>

                <label>
                  Security code
                  <input placeholder="CVC" disabled />
                </label>
              </div>
            </div>

            <label className={styles.paymentRadio}>
              <input type="radio" name="paymentMethod" />
              <span>Debit &amp; Credit Cards</span>
            </label>

            <label className={styles.paymentRadio}>
              <input type="radio" name="paymentMethod" />
              <span>PayPal</span>
            </label>
          </div>

          <p className={styles.privacyText}>
            Your personal data will be used to process your order, support your experience
            throughout this website, and for other purposes described in our{' '}
            <button type="button">privacy policy</button>.
          </p>

          {/* <div className={styles.recaptchaMock}>
            <label>
              <input type="checkbox" />
              <span>I&apos;m not a robot</span>
            </label>
            <strong>reCAPTCHA</strong>
          </div> */}

          <button className={styles.placeOrderButton} type="submit" disabled={!items.length}>
            Place order
          </button>
        </aside>
      </form>

      {showLoginToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
          background: '#1a1a1a', color: '#fff', borderRadius: 10,
          padding: '14px 18px', boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: 14, minWidth: 280,
          animation: 'order-toast-in 0.3s ease',
        }}>
          <span style={{ fontSize: 14 }}>Please login first to place an order.</span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => router.push('/login?redirect=/checkout')}
              style={{
                background: '#fff', color: '#1a1a1a', border: 'none',
                borderRadius: 6, padding: '6px 14px', fontWeight: 600,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowLoginToast(false)}
              style={{
                background: 'transparent', color: '#aaa', border: 'none',
                borderRadius: 6, padding: '6px 8px', fontSize: 13, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}













// 'use client';

// import { FormEvent, useEffect, useMemo, useState } from 'react';
// import { API_URL } from '@/lib/api';
// import styles from './Checkout.module.css';

// type CartItem = {
//   slug: string;
//   productId: string;
//   name: string;
//   price: number;
//   image: string;
//   quantity: number;
// };

// const CART_KEY = 'asiance_cart';

// function money(value: number) {
//   return `Rs ${Number(value || 0).toLocaleString()}`;
// }

// export function CheckoutClient() {
//   const [items, setItems] = useState<CartItem[]>([]);
//   const [status, setStatus] = useState('');

//   useEffect(() => {
//     setItems(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'));
//   }, []);

//   const total = useMemo(
//     () =>
//       items.reduce(
//         (sum, item) =>
//           sum + Number(item.price || 0) * Number(item.quantity || 1),
//         0,
//       ),
//     [items],
//   );

//   async function submit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const form = new FormData(event.currentTarget);

//     const fullName = `${String(form.get('firstName') || '')} ${String(
//       form.get('lastName') || '',
//     )}`.trim();

//     const address = [
//       String(form.get('address1') || ''),
//       String(form.get('address2') || ''),
//       String(form.get('city') || ''),
//       String(form.get('state') || ''),
//       String(form.get('postcode') || ''),
//       String(form.get('country') || ''),
//       String(form.get('phone') || ''),
//       String(form.get('notes') || ''),
//     ]
//       .filter(Boolean)
//       .join(', ');

//     const payload = {
//       email: String(form.get('email')),
//       name: fullName,
//       address,
//       items,
//     };

//     try {
//       const response = await fetch(`${API_URL}/shop/orders`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) throw new Error('Order failed');

//       localStorage.removeItem(CART_KEY);
//       setItems([]);
//       setStatus('Order received. The admin panel will show it once MongoDB is connected.');
//     } catch {
//       setStatus('The API is offline. Start the Nest server and MongoDB, then submit again.');
//     }
//   }

//   return (
//     <section className={styles.checkoutWrap}>
//       <h1 className={styles.checkoutTitle}>Checkout</h1>

//       <div className={styles.couponBox}>
//         <span className={styles.squareIcon} />
//         <span>
//           Have a coupon?{' '}
//           <button type="button">Click here to enter your code</button>
//         </span>
//       </div>

//       <form className={styles.checkoutGrid} onSubmit={submit}>
//         <section className={styles.billingPanel}>
//           <h2>Billing details</h2>
//           <div className={styles.checkoutLine} />

//           <div className={styles.twoCols}>
//             <label>
//               First name <span>*</span>
//               <input name="firstName" required />
//             </label>

//             <label>
//               Last name <span>*</span>
//               <input name="lastName" required />
//             </label>
//           </div>

//           <label>
//             Company name <small>(optional)</small>
//             <input name="company" />
//           </label>

//           <label>
//             Country / Region <span>*</span>
//             <select name="country" defaultValue="Pakistan" required>
//               <option>Pakistan</option>
//               <option>United Arab Emirates</option>
//               <option>Saudi Arabia</option>
//               <option>United Kingdom</option>
//               <option>United States</option>
//             </select>
//           </label>

//           <label>
//             Street address <span>*</span>
//             <input name="address1" placeholder="House number and street name" required />
//             <input name="address2" placeholder="Apartment, suite, unit, etc. (optional)" />
//           </label>

//           <label>
//             Town / City <span>*</span>
//             <input name="city" required />
//           </label>

//           <label>
//             State / County <span>*</span>
//             <select name="state" defaultValue="Sindh" required>
//               <option>Sindh</option>
//               <option>Punjab</option>
//               <option>Balochistan</option>
//               <option>Khyber Pakhtunkhwa</option>
//               <option>Islamabad Capital Territory</option>
//             </select>
//           </label>

//           <label>
//             Postcode / ZIP <span>*</span>
//             <input name="postcode" required />
//           </label>

//           <label>
//             Phone <span>*</span>
//             <input name="phone" required />
//           </label>

//           <label>
//             Email address <span>*</span>
//             <input name="email" type="email" required />
//           </label>

//           <div className={styles.additionalInfo}>
//             <h2>Additional information</h2>
//             <div className={styles.checkoutLine} />

//             <label>
//               Order notes <small>(optional)</small>
//               <textarea
//                 name="notes"
//                 rows={4}
//                 placeholder="Notes about your order, e.g. special notes for delivery."
//               />
//             </label>
//           </div>
//         </section>

//         <aside className={styles.orderBox}>
//           <h2>Your order</h2>

//           <div className={styles.orderTable}>
//             <div className={styles.orderHead}>
//               <strong>Product</strong>
//               <strong>Subtotal</strong>
//             </div>

//             {items.length ? (
//               items.map((item, index) => (
//                 <div className={styles.orderRow} key={`${item.slug}-${index}`}>
//                   <span>
//                     {item.name} × {item.quantity || 1}
//                   </span>
//                   <span>{money(Number(item.price || 0) * Number(item.quantity || 1))}</span>
//                 </div>
//               ))
//             ) : (
//               <div className={styles.orderRow}>
//                 <span>Your bag is empty</span>
//                 <span>{money(0)}</span>
//               </div>
//             )}

//             <div className={styles.orderRow}>
//               <span>Subtotal</span>
//               <span>{money(total)}</span>
//             </div>

//             <div className={`${styles.orderRow} ${styles.totalRow}`}>
//               <span>Total</span>
//               <span>{money(total)}</span>
//             </div>
//           </div>

//           <div className={styles.paymentNotice}>
//             <span className={styles.squareIcon} />
//             <p>
//               Sorry, it seems that there are no available payment methods. Please contact us if you
//               require assistance or wish to make alternate arrangements.
//             </p>
//           </div>

//           <p className={styles.privacyText}>
//             Your personal data will be used to process your order, support your experience
//             throughout this website, and for other purposes described in our{' '}
//             <button type="button">privacy policy</button>.
//           </p>

//           <button className={styles.placeOrderButton} type="submit" disabled={!items.length}>
//             Place order
//           </button>

//           {status ? <p className={styles.statusText}>{status}</p> : null}
//         </aside>
//       </form>
//     </section>
//   );
// }