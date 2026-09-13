// 每个群独立保存专属链接，Cookie 过期后可重新建立会话。
export async function restoreGroupSession(group: string): Promise<boolean> {
  const storageKey = `duizhang:token:${group}`;
  const linkKey = new URLSearchParams(window.location.hash.slice(1)).get("key");
  let savedKey: string | null = null;
  try { savedKey = window.localStorage.getItem(storageKey); } catch { /* 禁用存储时仍可使用专属链接。 */ }
  const key = linkKey ?? savedKey;
  if (key === null) return true;

  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group, key }),
  });
  if (response.status === 401) {
    if (linkKey === null) {
      try { window.localStorage.removeItem(storageKey); } catch { /* 存储可能不可用。 */ }
    }
    return false;
  }
  if (!response.ok) throw Error("暂时无法恢复访问，请重试。");

  try { window.localStorage.setItem(storageKey, key); } catch { /* 当前会话仍可通过 Cookie 使用。 */ }
  if (linkKey !== null) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  return true;
}
