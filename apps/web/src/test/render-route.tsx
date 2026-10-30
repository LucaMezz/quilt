import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { Mock } from "vitest";

import { routeTree } from "@/routeTree.gen";

const signedInUser = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  image: null,
};

export async function renderRoute(path: string, getSession: Mock) {
  getSession.mockResolvedValue({
    data: { user: signedInUser, session: { id: "s1" } },
  });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: {} as never,
  });
  render(<RouterProvider router={router} />);
  await router.load();
  return router;
}
