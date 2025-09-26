import type { AppProps } from "next/app";
import { useEffect, useRef, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import { useRouter } from "next/router";

import "../styles/global.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const resizeObserverRef = useRef<MutationObserver | null>(null);

  // Post our current document height to any embedding parent (e.g., Wix) so the iframe can auto-resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      return height;
    };

    const postSize = () => {
      const height = computeHeight();
      // Send a structured message; the parent page should listen for type === 'EMBED_SIZE'
      window.parent?.postMessage({ type: "EMBED_SIZE", height }, "*");
    };

    // Debounce to avoid message floods during rapid changes
    let rafId = 0 as number | null as any;
    const requestPostSize = () => {
      if (rafId) cancelAnimationFrame(rafId as number);
      rafId = requestAnimationFrame(postSize) as any;
    };

    // Initial send
    postSize();

    // Update on window resize
    window.addEventListener("resize", requestPostSize);

    // Update on DOM changes (content loads, accordions, etc.)
    resizeObserverRef.current = new MutationObserver(requestPostSize);
    resizeObserverRef.current.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Update on Next.js route changes
    const onRouteDone = () => setTimeout(postSize, 0);
    router.events.on("routeChangeComplete", onRouteDone);

    return () => {
      window.removeEventListener("resize", requestPostSize);
      router.events.off("routeChangeComplete", onRouteDone);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (rafId) cancelAnimationFrame(rafId as number);
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <title>Nutrition Calculator</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
        </Head>
        <Component/>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
