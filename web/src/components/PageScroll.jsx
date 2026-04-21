/**
 * PageScroll — wraps normal pages so they scroll independently.
 * ChatPage does NOT use this — it manages its own scroll.
 */
export default function PageScroll({ children, style = {} }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', ...style }}>
      {children}
    </div>
  );
}
