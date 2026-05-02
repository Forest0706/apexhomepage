const STORAGE_KEY = 'wishlist_guest';

export const localWishlist = {
  get(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  },

  add(productId: string) {
    const list = this.get();
    if (!list.includes(productId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, productId]));
    }
  },

  remove(productId: string) {
    const list = this.get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(list.filter((id) => id !== productId)),
    );
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
