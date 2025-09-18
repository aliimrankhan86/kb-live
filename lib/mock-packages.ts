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
      image: "/hotel-makkah-1.jpg"
    },
    madinaHotel: {
      name: "Madinah Hilton",
      location: "Madinah", 
      rating: 4,
      distance: "0.1km from Haram",
      image: "/hotel-madina-1.jpg"
    },
    price: 2899,
    currency: "£",
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
      image: "/hotel-makkah-2.jpg"
    },
    madinaHotel: {
      name: "Pullman Zamzam Madina",
      location: "Madinah",
      rating: 4,
      distance: "0.3km from Haram",
      image: "/hotel-madina-2.jpg"
    },
    price: 3299,
    currency: "£",
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
      image: "/hotel-makkah-3.jpg"
    },
    madinaHotel: {
      name: "Shaza Madina",
      location: "Madinah",
      rating: 5,
      distance: "0.2km from Haram",
      image: "/hotel-madina-3.jpg"
    },
    price: 3899,
    currency: "£", 
    priceNote: "Starting from one person"
  }
];
