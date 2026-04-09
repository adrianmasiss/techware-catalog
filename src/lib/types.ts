export interface Spec {
  l: string;
  v: string;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  model: string;
  desc: string;
  image?: string; 
  images?: string[];
  price: string;
  priceNote: string;
  specs?: Spec[];
}
