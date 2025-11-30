import { FarcasterEmbed } from "react-farcaster-embed";

const testimonials = [
  "https://farcaster.xyz/avinashnayak/0x7e8c2b5b",
  "https://farcaster.xyz/ksa/0xfb8d8661",
  "https://farcaster.xyz/wealthmagnet.eth/0xcdbf563c",
  "https://farcaster.xyz/coolbeans1r.eth/0xa9580f36",
];

export function Testimonials() {
  return (
    <div className="mx-auto max-w-7xl px-4 overflow-x-auto">
      <div className="flex max-h-[600px] gap-6">
        {testimonials.map(testimonial => (
          <div
            key={testimonial}
            className="min-w-[300px] max-w-[300px] max-h-[300px] flex-shrink-0 overflow-y-auto overflow-x-hidden"
          >
            <FarcasterEmbed url={testimonial} />
          </div>
        ))}
      </div>
    </div>
  );
}
