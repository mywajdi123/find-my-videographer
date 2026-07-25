"use client";

import { useMemo, useState } from "react";

type Creator = {
  name: string;
  studio: string;
  city: string;
  specialty: string;
  rating: string;
  reviews: number;
  price: number;
  match: number;
  image: string;
  tags: string[];
  available: string;
  distance: number;
  mapX: number;
  mapY: number;
};

const creators: Creator[] = [
  {
    name: "Maya Chen",
    studio: "Maya Chen Films",
    city: "Washington, DC",
    specialty: "Weddings & celebrations",
    rating: "4.9",
    reviews: 48,
    price: 1800,
    match: 96,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=88",
    tags: ["Cinematic", "Warm", "Story-led"],
    available: "Available Oct 12",
    distance: 3.2,
    mapX: 49,
    mapY: 42,
  },
  {
    name: "Andre Brooks",
    studio: "Northline Studio",
    city: "Arlington, VA",
    specialty: "Brands & live events",
    rating: "5.0",
    reviews: 31,
    price: 1450,
    match: 92,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=88",
    tags: ["Documentary", "Bold", "Fast-paced"],
    available: "Available Oct 12",
    distance: 6.8,
    mapX: 31,
    mapY: 66,
  },
  {
    name: "Sofia Reyes",
    studio: "Evergreen Motion",
    city: "Silver Spring, MD",
    specialty: "Weddings & portraits",
    rating: "4.8",
    reviews: 64,
    price: 2100,
    match: 88,
    image:
      "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=1200&q=88",
    tags: ["Editorial", "Natural", "Romantic"],
    available: "Available Oct 13",
    distance: 11.4,
    mapX: 68,
    mapY: 23,
  },
];

const filters = ["All creators", "Weddings", "Events", "Brands", "Music"];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All creators");
  const [location, setLocation] = useState("Washington, DC");
  const [radius, setRadius] = useState(15);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingSent, setBookingSent] = useState(false);

  const visibleCreators = useMemo(() => {
    const nearbyCreators = creators.filter((creator) => creator.distance <= radius);
    if (activeFilter === "Weddings") {
      return nearbyCreators.filter((creator) =>
        creator.specialty.toLowerCase().includes("wedding"),
      );
    }
    if (activeFilter === "Events") {
      return nearbyCreators.filter((creator) =>
        creator.specialty.toLowerCase().includes("event"),
      );
    }
    return nearbyCreators;
  }, [activeFilter, radius]);

  function closeModal() {
    setSelectedCreator(null);
    setBookingSent(false);
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Find My Videographer home">
          <span className="brand-mark" aria-hidden="true"><i /></span>
          <span>Find My Videographer</span>
        </a>
        <div className="nav-links">
          <a href="#creators">Find videographers</a>
          <a href="#how-it-works">How it works</a>
          <a href="#for-creators">For creators</a>
        </div>
        <div className="nav-actions">
          <button className="text-button" type="button">Sign in</button>
          <button className="dark-button" type="button">List your work <span>↗</span></button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span />The DMV&apos;s creative marketplace</p>
          <h1>Your vision.<br /><em>The right lens.</em></h1>
          <p className="hero-intro">
            Discover trusted videographers whose style fits your story. Compare
            real portfolios, clear pricing, and availability—all in one place.
          </p>

          <div className="search-panel" aria-label="Find available videographers">
            <div className="search-heading">
              <strong>Find available videographers</strong>
              <span>Two details. Your best matches.</span>
            </div>
            <div className="search-fields">
              <label>
                <span>Event type</span>
                <select defaultValue="Wedding">
                  <option>Wedding</option>
                  <option>Brand campaign</option>
                  <option>Live event</option>
                  <option>Music video</option>
                </select>
              </label>
              <label>
                <span>Location</span>
                <input
                  value={location}
                  aria-label="Location"
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City or ZIP code"
                />
              </label>
              <button
                className="search-button"
                type="button"
                onClick={() =>
                  document.getElementById("creators")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Book now <span>→</span>
              </button>
            </div>
          </div>

          <div className="trust-line" aria-label="Marketplace promise">
            <span>✓ Verified portfolios</span>
            <span>✓ Upfront pricing</span>
            <span>✓ Real availability</span>
          </div>
        </div>

        <section className="hero-map" id="nearby-map" aria-label="Nearby videographers map">
          <div className="map-panel">
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <div className="map-road road-three" />
            <div className="map-water">POTOMAC</div>
            <div
              className="radius-circle"
              style={{ width: `${Math.min(82, 31 + radius * 2.2)}%`, aspectRatio: "1" }}
            />
            <span className="map-center" aria-label={`Search center: ${location}`}>
              <i />
            </span>
            {creators.map((creator, index) => (
              <button
                key={creator.studio}
                type="button"
                className={`map-marker ${creator.distance <= radius ? "" : "outside"}`}
                style={{ left: `${creator.mapX}%`, top: `${creator.mapY}%` }}
                aria-label={`${creator.studio}, ${creator.distance} miles away`}
                onClick={() => creator.distance <= radius && setSelectedCreator(creator)}
              >
                <span><i>{index + 1}</i></span>
                <small>{creator.studio}</small>
              </button>
            ))}
            <div className="map-controls" aria-label="Map controls">
              <button type="button" aria-label="Zoom in">+</button>
              <button type="button" aria-label="Zoom out">−</button>
            </div>
            <div className="map-status">
              <span><b>{visibleCreators.length}</b> available nearby</span>
              <span>{location || "Your area"}</span>
            </div>
          </div>
          <div className="hero-radius">
            <div>
              <span>Search radius</span>
              <strong>{radius} miles</strong>
            </div>
            <input
              className="radius-slider"
              type="range"
              min="5"
              max="25"
              step="5"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              aria-label="Search radius in miles"
            />
          </div>
          <p className="map-hint">Adjust the radius or select a marker to view and book a videographer.</p>
        </section>
      </section>

      <section className="creator-section" id="creators">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span />Available near {location || "your area"}</p>
            <h2>Videographers ready to book.</h2>
          </div>
          <p>
            Every creator is portfolio-reviewed. Prices shown are real starting
            rates—no hidden quote games.
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="Filter creators">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
          <button className="all-filters" type="button">All filters <span>☷</span></button>
        </div>

        <div className="creator-grid">
          {visibleCreators.map((creator) => (
            <article className="creator-card" key={creator.studio}>
              <div className="card-image">
                <img src={creator.image} alt={`${creator.studio} portfolio`} />
                <span className="availability">{creator.available}</span>
                <button type="button" aria-label={`Save ${creator.studio}`}>♡</button>
                <span className="card-match">{creator.match}% style match</span>
              </div>
              <div className="card-body">
                <div className="card-title">
                  <div>
                    <h3>{creator.studio}</h3>
                    <p>{creator.specialty} · {creator.city}</p>
                  </div>
                  <span>★ {creator.rating} <small>({creator.reviews})</small></span>
                </div>
                <div className="tags">
                  {creator.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="card-footer">
                  <p>From <strong>${creator.price.toLocaleString()}</strong></p>
                  <button type="button" onClick={() => setSelectedCreator(creator)}>
                    View portfolio ↗
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" id="how-it-works">
        <div className="process-copy">
          <p className="eyebrow light"><span />A better way to book</p>
          <h2>From inspiration<br />to “we found them.”</h2>
          <p>
            We replaced scattered DMs and mystery quotes with one clear,
            confidence-building process.
          </p>
          <button type="button" className="cream-button">Start your search <span>↗</span></button>
        </div>
        <ol>
          <li><span>01</span><div><h3>Show us your vision</h3><p>Upload a reference clip or tell us about your event.</p></div></li>
          <li><span>02</span><div><h3>Meet your best matches</h3><p>Compare portfolios, style, packages, and real availability.</p></div></li>
          <li><span>03</span><div><h3>Book with confidence</h3><p>Send one clear request and keep every detail organized.</p></div></li>
        </ol>
      </section>

      <section className="creator-cta" id="for-creators">
        <p>BEHIND THE CAMERA?</p>
        <h2>Great work deserves<br />to be found.</h2>
        <div>
          <span>
            Build a profile. Set transparent packages. Spend less time chasing
            leads and more time creating.
          </span>
          <button type="button" className="dark-button">Join as a creator <span>↗</span></button>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><i /></span>
          <span>Find My Videographer</span>
        </a>
        <p>Built in the DMV for the people who capture it.</p>
        <span>© 2026 Find My Videographer</span>
      </footer>

      {selectedCreator && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Book ${selectedCreator.studio}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={closeModal}>×</button>
            {bookingSent ? (
              <div className="success-state">
                <span>✓</span>
                <p>REQUEST SENT</p>
                <h2>You&apos;re one step closer.</h2>
                <p>
                  {selectedCreator.name} will respond within 24 hours. Your date
                  is being held while you connect.
                </p>
                <button className="dark-button" type="button" onClick={closeModal}>Back to creators</button>
              </div>
            ) : (
              <>
                <p className="modal-kicker">BOOKING REQUEST</p>
                <h2>Work with {selectedCreator.name}.</h2>
                <p className="modal-description">
                  Tell them a little about what you&apos;re planning. No payment
                  is collected until you agree on the details.
                </p>
                <form onSubmit={(event) => { event.preventDefault(); setBookingSent(true); }}>
                  <label>
                    Event type
                    <select required defaultValue="Wedding">
                      <option>Wedding</option>
                      <option>Brand campaign</option>
                      <option>Live event</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <div className="form-row">
                    <label>Date<input required type="date" defaultValue="2026-10-12" /></label>
                    <label>
                      Estimated budget
                      <select required defaultValue="$1,500–$2,500">
                        <option>$1,500–$2,500</option>
                        <option>$2,500–$4,000</option>
                        <option>$4,000+</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Tell us about your vision
                    <textarea
                      required
                      defaultValue="We're planning an intimate fall wedding and love warm, documentary-style films."
                    />
                  </label>
                  <button className="dark-button submit-button" type="submit">Send booking request <span>↗</span></button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
