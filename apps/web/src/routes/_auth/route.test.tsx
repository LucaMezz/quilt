// Used to create a fake browser to run the tests
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";

// We need to use `hoisted` here so that when running the test,
// vitest moves this line to the top, *above* the vi.mock call
// below
//
// The vi.hoisted(...) call simply marks the line for vitest to
// move it to the top. Other than that, it is equivalent to
// `const { getSession } = { getSession: vi.fn() };`.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

// **Any** file that imports auth-client during the test gets the
// mocked version.
//
// When Vitest loads and runs the test, this mock is moved to the
// top of the file, so that the other imports above it actually
// get the mocked version.
vi.mock("@/lib/auth-client", () => ({
  authClient: { getSession },
}));

// Create a fake browser with a real router to run the tests.
// Only thing different to the real browser is that it replaces
// is where the URL is stored, in this case with
// createMemoryHistory as opposed to createBrowserHistory.
async function loadAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: {} as never,
  });
  await router.load();
  return router;
}

// Named after the thing which is under test / being tested
describe("_auth route", () => {
  // One test. Name it as a sentence about behaviour
  it("redirects logged-out users to /login", async () => {
    // For this test, wherever `getSession` is called, it should
    // return an object with no data, meaning there is no session.
    getSession.mockResolvedValue({ data: null });

    const router = await loadAt("/dashboard");

    expect(router.state.location.pathname).toBe("/login");
  });

  it("allows logged-in users to access /dashboard", async () => {
    getSession.mockResolvedValue({
      data: {
        user: { id: "u1", name: "Ada", email: "ada@example.com" },
        session: { id: "s1" },
      },
    });

    const router = await loadAt("/dashboard");

    expect(router.state.location.pathname).toBe("/dashboard");
  });
});
