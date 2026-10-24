import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QcFigure } from "./qc-figure"

describe("QcFigure", () => {
  it("pairs a label with its value, an info slot and a note", () => {
    render(
      <dl>
        <QcFigure label="Heating demand" value="1.2 GWh/a" info={<button>i</button>} note="2 % less" />
      </dl>,
    )
    expect(screen.getByText("Heating demand").tagName).toBe("DT")
    expect(screen.getByText("1.2 GWh/a")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "i" })).toBeInTheDocument()
    expect(screen.getByText("2 % less")).toBeInTheDocument()
  })
})
