import { useCallback, useState } from 'react';

export type FlyToCartOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Flight = {
  id: number;
  origin: FlyToCartOrigin;
};

let nextFlightId = 0;

export function useFlyToCart() {
  const [flights, setFlights] = useState<Flight[]>([]);

  const trigger = useCallback((origin: FlyToCartOrigin) => {
    nextFlightId += 1;
    const id = nextFlightId;
    setFlights((prev) => [...prev, { id, origin }]);
  }, []);

  const complete = useCallback((id: number) => {
    setFlights((prev) => prev.filter((flight) => flight.id !== id));
  }, []);

  return { flights, trigger, complete };
}
