import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Detail, DetailList } from "./detail-list";

describe("DetailList", () => {
  it("pairs each label with its value", () => {
    render(
      <DetailList>
        <Detail label="Region">London</Detail>
        <Detail label="CPUs">4</Detail>
      </DetailList>,
    );

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(
      ["Region", "CPUs"],
    );
    expect(
      screen.getAllByRole("definition").map((value) => value.textContent),
    ).toEqual(["London", "4"]);
  });
});
