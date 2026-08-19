import { BOAT_MEDIA } from "@/lib/boat-media";

type BoatMediaClusterProps = {
  variant?: "standard" | "compact" | "wide";
  className?: string;
};

export function BoatMediaCluster({ variant = "standard", className = "" }: BoatMediaClusterProps) {
  return (
    <div className={`site-media-cluster site-media-cluster-${variant} ${className}`.trim()} aria-hidden="true">
      <figure className="site-media-cluster-map">
        <img src={BOAT_MEDIA.coast} alt="" />
      </figure>
      <figure className="site-media-cluster-photo site-media-cluster-photo-a">
        <img src={BOAT_MEDIA.dock} alt="" loading="lazy" decoding="async" />
      </figure>
      <figure className="site-media-cluster-photo site-media-cluster-photo-b">
        <img src={BOAT_MEDIA.boarding} alt="" loading="lazy" decoding="async" />
      </figure>
      <figure className="site-media-cluster-photo site-media-cluster-photo-c">
        <img src={BOAT_MEDIA.passenger} alt="" loading="lazy" decoding="async" />
      </figure>
      <span className="site-media-cluster-line" />
    </div>
  );
}

