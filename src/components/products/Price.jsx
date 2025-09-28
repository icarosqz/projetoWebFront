
export default function Price({ currentPrice, originalPrice }) {
  const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(currentPrice);
  const formattedCurrentPrice = Number(currentPrice).toFixed(2).replace('.', ',');
  const formattedOriginalPrice = hasDiscount ? Number(originalPrice).toFixed(2).replace('.', ',') : null;

  return (
    <div className="mt-1 flex items-baseline justify-center gap-2">
      <p className="text-xl font-bold text-foreground">
        R$ {formattedCurrentPrice}
      </p>
      {hasDiscount && (
        <p className="text-sm text-muted-foreground line-through">
          R$ {formattedOriginalPrice}
        </p>
      )}
    </div>
  );
}