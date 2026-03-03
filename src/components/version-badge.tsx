import packageJson from "../../package.json";

export function VersionBadge() {
  return (
    <div
      className="fixed bottom-4 left-4 z-50 text-xs text-muted-foreground/70 font-mono"
      title="앱 버전"
    >
      v{packageJson.version}
    </div>
  );
}
