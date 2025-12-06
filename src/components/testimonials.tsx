import { FarcasterEmbed } from "react-farcaster-embed";

import { Card } from "./ui/card";

const testimonials = [
  "https://farcaster.xyz/nounishprof/0x78f2dafc",
  "https://farcaster.xyz/mikedcryptoguy/0x5d760ab0",
  "https://farcaster.xyz/chikay/0xf7c9987a",
  "https://farcaster.xyz/avinashnayak/0x7e8c2b5b",
  "https://farcaster.xyz/psych3/0x25534958",
  "https://farcaster.xyz/ksa/0xfb8d8661",
  "https://farcaster.xyz/wealthmagnet.eth/0xcdbf563c",
  "https://farcaster.xyz/coolbeans1r.eth/0xa9580f36",
];

export function Testimonials() {
  return (
    <div className="mx-auto max-w-7xl overflow-x-auto">
      <div className="flex max-h-[600px] gap-6 py-2">
        {testimonials.map(testimonial => (
          <Card
            key={testimonial}
            className="min-w-[300px] max-w-[300px] max-h-[300px] flex-shrink-0 overflow-y-auto overflow-x-hidden pt-0 shadow"
          >
            <FarcasterEmbed url={testimonial} />
          </Card>
        ))}
      </div>
    </div>
  );
}
