export interface FlightSegment {
  date: string;
  duration: string;
  route: string;
}

export interface Hotel {
  name: string;
  location: string;
  rating: number;
  distance: string;
  image: string;
}

export interface Package {
  id: string;
  departure: FlightSegment;
  return: FlightSegment;
  makkahHotel: Hotel;
  madinaHotel: Hotel;
  price: number;
  currency: string;
  priceNote: string;
}

export const mockPackages: Package[] = [
  {
    id: "package-1",
    departure: {
      date: "15 Mar 2024",
      duration: "6h 45m",
      route: "LHR → JED"
    },
    return: {
      date: "25 Mar 2024", 
      duration: "7h 15m",
      route: "JED → LHR"
    },
    makkahHotel: {
      name: "Makkah Clock Royal Tower",
      location: "Makkah",
      rating: 5,
      distance: "0.2km from Haram",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    madinaHotel: {
      name: "Madinah Hilton",
      location: "Madinah", 
      rating: 4,
      distance: "0.1km from Haram",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    price: 2899,
    currency: "GBP",
    priceNote: "Starting from one person"
  },
  {
    id: "package-2",
    departure: {
      date: "22 Mar 2024",
      duration: "6h 30m", 
      route: "LHR → JED"
    },
    return: {
      date: "01 Apr 2024",
      duration: "7h 20m",
      route: "JED → LHR"
    },
    makkahHotel: {
      name: "Swissotel Makkah",
      location: "Makkah",
      rating: 5,
      distance: "0.1km from Haram", 
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    madinaHotel: {
      name: "Pullman Zamzam Madina",
      location: "Madinah",
      rating: 4,
      distance: "0.3km from Haram",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    price: 3299,
    currency: "GBP",
    priceNote: "Starting from one person"
  },
  {
    id: "package-3",
    departure: {
      date: "05 Apr 2024",
      duration: "6h 55m",
      route: "LHR → JED"
    },
    return: {
      date: "15 Apr 2024",
      duration: "7h 10m", 
      route: "JED → LHR"
    },
    makkahHotel: {
      name: "Fairmont Makkah Clock Royal Tower",
      location: "Makkah",
      rating: 5,
      distance: "0.1km from Haram",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    madinaHotel: {
      name: "Shaza Madina",
      location: "Madinah",
      rating: 5,
      distance: "0.2km from Haram",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+"
    },
    price: 3899,
    currency: "GBP", 
    priceNote: "Starting from one person"
  }
];
