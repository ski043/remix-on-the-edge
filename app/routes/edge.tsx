/* import type { LoaderArgs } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';

import { Footer } from '~/components/footer';
import { Region } from '~/components/region';
import { Illustration } from '~/components/illustration';
import { parseVercelId } from '~/parse-vercel-id';

export const config = { runtime: 'edge' };

let isCold = true;
let initialDate = Date.now();

export async function loader({ request }: LoaderArgs) {
  const wasCold = isCold;
  isCold = false;

  const parsedId = parseVercelId(request.headers.get("x-vercel-id"));

  return {
    ...parsedId,
    isCold: wasCold,
    date: new Date().toISOString(),
  };
}

export function headers() {
  return {
    'x-edge-age': Date.now() - initialDate,
  };
}

export default function App() {
  const { proxyRegion, computeRegion, isCold, date } = useLoaderData<typeof loader>();
  return (
    <>
      <main>
        <Illustration />
        <div className="meta">
          <div className="info">
            <span>Proxy Region</span>
            <Region region={proxyRegion} />
          </div>
          <div className="info">
            <span>Compute Region</span>
            <Region region={computeRegion} />
          </div>
        </div>
      </main>

      <Footer>
        <p>
          Generated at {date} <span data-break /> ({isCold ? 'cold' : 'hot'}) by{' '}
          <a href="https://vercel.com/docs/concepts/functions/edge-functions" target="_blank" rel="noreferrer">
            Vercel Edge Runtime
          </a>
        </p>
      </Footer>
    </>
  );
}
 */

import { json, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";
import { db } from "~/db.server";
import { parseVercelId } from "~/parse-vercel-id";

export const config = { runtime: "edge" };

export async function loader({ request }: LoaderArgs) {
  const parsedId = parseVercelId(request.headers.get("x-vercel-id"));
  const data = await db.car.findMany({
    where: {
      status: "LIVE",
    },
  });

  return json({ data, ...parsedId });
}

const Edge = () => {
  const { data, computeRegion, proxyRegion } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:col-span-3 lg:gap-x-8">
        {data.map((auto) => (
          <Link
            key={auto.id}
            to={`/auto/${auto.id}`}
            prefetch="intent"
            rel="prefetch"
            className="group text-sm"
          >
            <div className="w-full aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100 group-hover:opacity-75">
              <img
                src={auto.imgSrc}
                className="w-full h-full object-center object-cover"
              />
            </div>
            <h3 className="mt-4 font-medium text-gray-900">
              {auto.marke} {auto.modell} {auto.erstzulassung}
            </h3>
            <p className="mt-2 font-medium text-gray-900">
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(auto.preis)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Edge;
