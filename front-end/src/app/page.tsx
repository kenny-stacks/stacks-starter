// TODO: Restore campaign functionality in Phase 2 with shadcn components
// Previous implementation used Chakra UI components that have been removed

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Stacks Starter</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Developer-friendly starter kit for building on Stacks
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-2">Foundation Setup Complete</h2>
            <p className="text-muted-foreground">
              Phase 1 is establishing the development foundation. The theme toggle will be added in Task 4.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2">What&apos;s Next?</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Phase 2: UI Component Library (rebuild with shadcn)</li>
              <li>Phase 3: Wallet Integration</li>
              <li>Phase 4: Smart Contract Integration</li>
              <li>Phase 5: Developer Experience Polish</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
