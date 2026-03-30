import type { ReactNode } from "react";

import { images } from "@utils/images";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full rounded-3xl lg:flex">
          <img
            src={images.authBanner.src}
            className="rounded-3xl object-cover"
          />
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
