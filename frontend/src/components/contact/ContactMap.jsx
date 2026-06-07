import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { HiLocationMarker, HiExternalLink } from 'react-icons/hi';
import { APP_CONFIG } from '../../config/constants';

const COORDS = [25.78, -80.13];

const ContactMap = () => {
  return (
    <section className="container-custom pb-12 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(8,51,68,0.14)] ring-1 ring-black/5 sm:rounded-[26px]"
      >
        <div className="h-[320px] sm:h-[400px] lg:h-[460px]">
          <MapContainer
            center={COORDS}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={COORDS}>
              <Popup>
                <strong>Miami Luxury Rentals</strong>
                <br />
                {APP_CONFIG.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Floating address card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] sm:left-6 sm:right-auto sm:max-w-sm"
        >
          <div className="pointer-events-auto rounded-2xl bg-white/95 p-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark,#e73968)] text-white shadow-lg">
                <HiLocationMarker className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--color-text-primary)]">
                  Visit our office
                </h3>
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                  {APP_CONFIG.address}
                </p>
                
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(APP_CONFIG.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark,#e73968)]"
                >
                  Get directions
                  <HiExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactMap;