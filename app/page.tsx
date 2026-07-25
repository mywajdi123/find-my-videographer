"use client";

import { useMemo, useState } from "react";
import { RealMap } from "./RealMap";

type Creator = {
  name: string;
  studio: string;
  city: string;
  specialty: string;
  rating: string;
  reviews: number;
  hourlyRate: number;
  eventRates: Record<string, number>;
  averageRates: Record<string, number>;
  completedBookings: number;
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
    hourlyRate: 225,
    eventRates: { Wedding: 1800, "Brand campaign": 1350, "Live event": 950, "Music video": 1500, Other: 800 },
    averageRates: { Wedding: 2240, "Brand campaign": 1620, "Live event": 1180, "Music video": 1760, Other: 980 },
    completedBookings: 38,
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
    hourlyRate: 180,
    eventRates: { Wedding: 1450, "Brand campaign": 1100, "Live event": 800, "Music video": 1250, Other: 650 },
    averageRates: { Wedding: 1790, "Brand campaign": 1380, "Live event": 990, "Music video": 1480, Other: 820 },
    completedBookings: 27,
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
    hourlyRate: 260,
    eventRates: { Wedding: 2100, "Brand campaign": 1550, "Live event": 1200, "Music video": 1700, Other: 900 },
    averageRates: { Wedding: 2580, "Brand campaign": 1880, "Live event": 1430, "Music video": 2040, Other: 1120 },
    completedBookings: 51,
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
  const [eventType, setEventType] = useState("Wedding");
  const [customEventType, setCustomEventType] = useState("");
  const [pricingMode, setPricingMode] = useState<"event" | "hourly">("event");
  const [sortOrder, setSortOrder] = useState<"recommended" | "low" | "high">("recommended");
  const [startDate, setStartDate] = useState("2026-10-12");
  const [endDate, setEndDate] = useState("2026-10-13");
  const [dateFlexibility, setDateFlexibility] = useState("Exact dates");
  const [location, setLocation] = useState("Washington, DC");
  const [radius, setRadius] = useState(15);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.9072, -77.0369]);
  const [resolvedLocation, setResolvedLocation] = useState("Washington, DC");
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingSent, setBookingSent] = useState(false);

  const selectedEvent = eventType === "Other" ? customEventType || "Other" : eventType;

  function getStartingRate(creator: Creator) {
    return pricingMode === "hourly"
      ? creator.hourlyRate
      : creator.eventRates[selectedEvent] ?? creator.eventRates.Other;
  }

  function getAverageRate(creator: Creator) {
    return pricingMode === "hourly"
      ? Math.round(creator.hourlyRate * 1.15)
      : creator.averageRates[selectedEvent] ?? creator.averageRates.Other;
  }

  const visibleCreators = useMemo(() => {
    const nearbyCreators = creators.filter((creator) => creator.distance <= radius);
    let filteredCreators = nearbyCreators;
    if (activeFilter === "Weddings") {
      filteredCreators = nearbyCreators.filter((creator) =>
        creator.specialty.toLowerCase().includes("wedding"),
      );
    }
    if (activeFilter === "Events") {
      filteredCreators = nearbyCreators.filter((creator) =>
        creator.specialty.toLowerCase().includes("event"),
      );
    }
    return [...filteredCreators].sort((a, b) => {
      if (sortOrder === "low") return getStartingRate(a) - getStartingRate(b);
      if (sortOrder === "high") return getStartingRate(b) - getStartingRate(a);
      return b.match - a.match;
    });
  }, [activeFilter, pricingMode, radius, selectedEvent, sortOrder]);

  function closeModal() {
    setSelectedCreator(null);
    setBookingSent(false);
  }

  async function openLocationMap() {
    const query = location.trim();
    if (!query) {
      setLocationError("Enter a city, ZIP code, or address.");
      return;
    }

    setLocating(true);
    setLocationError("");

    try {
      const cacheKey = `fmv-location:${query.toLowerCase()}`;
      const cached = window.sessionStorage.getItem(cacheKey);
      const result = cached
        ? JSON.parse(cached)
        : await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`,
          ).then((response) => {
            if (!response.ok) throw new Error("Location search failed");
            return response.json();
          });
      const matches = Array.isArray(result) ? result : [result];

      if (!matches[0]) {
        setLocationError("We couldn’t find that location. Try a city and state or ZIP code.");
        return;
      }

      if (!cached) window.sessionStorage.setItem(cacheKey, JSON.stringify(matches));
      setMapCenter([Number(matches[0].lat), Number(matches[0].lon)]);
      setResolvedLocation(matches[0].display_name ?? query);
      setMapOpen(true);
    } catch {
      setLocationError("The map service is temporarily unavailable. Please try again.");
    } finally {
      setLocating(false);
    }
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
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                >
                  <option>Wedding</option>
                  <option>Brand campaign</option>
                  <option>Live event</option>
                  <option>Music video</option>
                  <option>Other</option>
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
                onClick={openLocationMap}
              >
                {locating ? "Finding…" : "Book now"} <span>→</span>
              </button>
            </div>
            {locationError && <p className="location-error">{locationError}</p>}
            {eventType === "Other" && (
              <label className="custom-event-field">
                <span>Your event type</span>
                <input
                  autoFocus
                  value={customEventType}
                  onChange={(event) => setCustomEventType(event.target.value)}
                  placeholder="e.g. Graduation, proposal, community event"
                  aria-label="Custom event type"
                />
              </label>
            )}
            <div className="date-search-row">
              <label>
                <span>Start date</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <span className="date-arrow">→</span>
              <label>
                <span>End date</span>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
              <label className="flex-date">
                <span>My dates are</span>
                <select value={dateFlexibility} onChange={(event) => setDateFlexibility(event.target.value)}>
                  <option>Exact dates</option>
                  <option>Flexible ±1 day</option>
                  <option>Flexible ±3 days</option>
                  <option>Flexible ±1 week</option>
                </select>
              </label>
            </div>
          </div>

          <div className="trust-line" aria-label="Marketplace promise">
            <span>✓ Verified portfolios</span>
            <span>✓ Upfront pricing</span>
            <span>✓ Real availability</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Featured videographer">
          <img
            src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1500&q=88"
            alt="Videographer filming a live celebration"
          />
          <div className="visual-topline"><span>Featured creator</span><span>Washington, DC</span></div>
          <div className="creator-overlay">
            <div><p>MAYA CHEN FILMS</p><strong>Cinematic stories,<br />honestly told.</strong></div>
            <span className="round-arrow">↗</span>
          </div>
          <div className="match-badge"><b>96%</b><span>style match</span></div>
        </div>
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
          <div className="pricing-controls">
            <div className="rate-toggle" role="group" aria-label="Rate type">
              <button type="button" className={pricingMode === "event" ? "active" : ""} onClick={() => setPricingMode("event")}>Per event</button>
              <button type="button" className={pricingMode === "hourly" ? "active" : ""} onClick={() => setPricingMode("hourly")}>Hourly</button>
            </div>
            <label className="sort-control">
              <span>Sort</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "recommended" | "low" | "high")}>
                <option value="recommended">Recommended</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
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
                  <div className="rate-summary">
                    <p>Starting from</p>
                    <strong>
                      ${getStartingRate(creator).toLocaleString()}
                      <small>{pricingMode === "hourly" ? " / hour" : " / event"}</small>
                    </strong>
                    <span>
                      Typical {selectedEvent.toLowerCase()}: ${getAverageRate(creator).toLocaleString()}
                      {pricingMode === "hourly" ? "/hr" : ""} · based on {creator.completedBookings} bookings
                    </span>
                  </div>
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

      {mapOpen && (
        <div className="map-modal-backdrop" role="presentation" onMouseDown={() => setMapOpen(false)}>
          <section
            className="real-map-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Videographers near your location"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p>AVAILABLE NEAR YOU</p>
                <h2>Choose a videographer.</h2>
                <span>{resolvedLocation}</span>
              </div>
              <button type="button" onClick={() => setMapOpen(false)} aria-label="Close map">×</button>
            </header>
            <div className="real-map-layout">
              <RealMap
                center={mapCenter}
                locationLabel={location}
                radius={radius}
                creators={visibleCreators}
                onSelectCreator={(studio) => {
                  const creator = creators.find((item) => item.studio === studio);
                  if (creator) {
                    setMapOpen(false);
                    setSelectedCreator(creator);
                  }
                }}
              />
              <aside>
                <div className="real-radius-control">
                  <div><span>Search radius</span><strong>{radius} miles</strong></div>
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
                <p className="result-count"><b>{visibleCreators.length}</b> available videographer{visibleCreators.length === 1 ? "" : "s"}</p>
                <div className="map-result-list">
                  {visibleCreators.map((creator, index) => (
                    <button
                      type="button"
                      key={creator.studio}
                      onClick={() => {
                        setMapOpen(false);
                        setSelectedCreator(creator);
                      }}
                    >
                      <span>{index + 1}</span>
                      <div>
                        <strong>{creator.studio}</strong>
                        <small>
                          {creator.distance} mi · From ${getStartingRate(creator).toLocaleString()}
                          {pricingMode === "hourly" ? "/hr" : "/event"}
                        </small>
                      </div>
                      <b>↗</b>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
            <footer className="map-attribution-note">
              Location search and map data © OpenStreetMap contributors. Search runs only when you submit a location.
            </footer>
          </section>
        </div>
      )}

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
                    <select required value={eventType} onChange={(event) => setEventType(event.target.value)}>
                      <option>Wedding</option>
                      <option>Brand campaign</option>
                      <option>Live event</option>
                      <option>Music video</option>
                      <option>Other</option>
                    </select>
                  </label>
                  {eventType === "Other" && (
                    <label>
                      Your event type
                      <input
                        required
                        value={customEventType}
                        onChange={(event) => setCustomEventType(event.target.value)}
                        placeholder="e.g. Graduation or proposal"
                      />
                    </label>
                  )}
                  <div className="form-row">
                    <label>
                      Start date
                      <input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </label>
                    <label>
                      End date
                      <input required type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                    </label>
                  </div>
                  <label>
                    Date flexibility
                    <select value={dateFlexibility} onChange={(event) => setDateFlexibility(event.target.value)}>
                      <option>Exact dates</option>
                      <option>Flexible ±1 day</option>
                      <option>Flexible ±3 days</option>
                      <option>Flexible ±1 week</option>
                    </select>
                  </label>
                  <div className="booking-rate-choice">
                    <span>How would you like to book?</span>
                    <div>
                      <button type="button" className={pricingMode === "event" ? "active" : ""} onClick={() => setPricingMode("event")}>Per event</button>
                      <button type="button" className={pricingMode === "hourly" ? "active" : ""} onClick={() => setPricingMode("hourly")}>Hourly</button>
                    </div>
                  </div>
                  {pricingMode === "hourly" && (
                    <label>
                      Estimated time
                      <select defaultValue="2">
                        <option value="0.5">30 minutes</option>
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                      </select>
                    </label>
                  )}
                  <div className="historical-estimate">
                    <div>
                      <span>Starting from</span>
                      <strong>
                        ${getStartingRate(selectedCreator).toLocaleString()}
                        <small>{pricingMode === "hourly" ? "/hour" : "/event"}</small>
                      </strong>
                    </div>
                    <p>
                      Similar {selectedEvent.toLowerCase()} bookings usually average{" "}
                      <b>${getAverageRate(selectedCreator).toLocaleString()}{pricingMode === "hourly" ? "/hour" : ""}</b>
                      {" "}based on {selectedCreator.completedBookings} previous jobs.
                    </p>
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
