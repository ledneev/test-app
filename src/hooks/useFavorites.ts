import { useState } from 'react';

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const isFavorite = (id: string) => favorites.includes(id);

  // Новый массив вместо мутации: иначе React видит ту же ссылку и не перерисовывает.
  // Функциональный апдейт — чтобы не опираться на устаревший favorites из замыкания.
  const toggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favoriteId) => favoriteId !== id) : [...prev, id],
    );
  };

  return { favorites, isFavorite, toggle };
}
