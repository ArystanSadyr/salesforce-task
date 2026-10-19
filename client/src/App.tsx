import { useEffect, useState } from "react";
import type { PriceResult, Product } from "../../src/types";

const money = new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 });
const reasonLabels: Record<PriceResult["reason"], string> = {
  UNDERCUT: "Под ценой конкурента",
  AT_MIN: "Достигнута минимальная цена",
  AT_MAX: "Достигнута максимальная цена",
  NO_COMPETITORS: "Нет конкурентов в наличии",
};

export default function App() {
  const [results, setResults] = useState<PriceResult[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function reprice(items: Product[]) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/reprice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!response.ok) throw new Error(`Сервер вернул ошибку (${response.status})`);
      setResults(await response.json() as PriceResult[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось получить цены.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/products.json");
        if (!response.ok) throw new Error("Не удалось загрузить товары.");
        const data = await response.json() as Product[];
        setProducts(data);
        await reprice(data);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось загрузить данные.");
        setLoading(false);
      }
    })();
  }, []);

  return <main className="page">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">S</span> SaleScout</a><span className="status"><i /> Сервис активен</span></header>
    <section className="intro">
      <p className="eyebrow">УПРАВЛЕНИЕ ЦЕНАМИ</p>
      <h1>Мониторинг цен</h1>
      <p className="subtitle">Сравните текущие цены с рекомендациями на основе предложений конкурентов.</p>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h2>Результаты переоценки</h2><p>{results.length} товаров · обновлено по текущим предложениям</p></div>
        <button onClick={() => void reprice(products)} disabled={loading || products.length === 0}>{loading ? "Обновляем…" : "↻　Пересчитать"}</button></div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading && results.length === 0 ? <div className="empty">Загружаем товары…</div> : <div className="table-wrap"><table>
        <thead><tr><th>ТОВАР</th><th>SKU</th><th>БЫЛО</th><th>СТАЛО</th><th>ПРИЧИНА</th></tr></thead>
        <tbody>{results.map((result) => <tr key={result.sku}>
          <td className="product-name">{products.find((product) => product.sku === result.sku)?.name ?? "—"}</td>
          <td className="sku">{result.sku}</td><td className="old-price">{money.format(result.oldPrice)} ₸</td>
          <td className="new-price">{money.format(result.newPrice)} ₸</td>
          <td><span className={`badge ${result.reason.toLowerCase()}`}>{reasonLabels[result.reason]}</span></td>
        </tr>)}</tbody>
      </table></div>}
      <footer>Цены рассчитаны автоматически. Минимальные и максимальные ограничения продавца учтены.</footer>
    </section>
  </main>;
}
