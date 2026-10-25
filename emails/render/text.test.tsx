// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderText } from "./text"

describe("renderText", () => {
  it("lays out headings, paragraphs, lists, tables and links as plain text", () => {
    const text = renderText(
      <html>
        <head>
          <title>ignored</title>
        </head>
        <body>
          <h1>Quick Check result</h1>
          <p>
            Your   project is <strong>promising</strong>.
          </p>
          <ul>
            <li>First</li>
            <li>Second</li>
          </ul>
          <table>
            <tbody>
              <tr>
                <td>Heating demand</td>
                <td>1.2 GWh/a</td>
              </tr>
              <tr>
                <td>Network length</td>
                <td>800 m</td>
              </tr>
            </tbody>
          </table>
          <div aria-hidden="true">decoration</div>
          <p>
            See the <a href="https://firstmove.energy/en/docs">docs</a> or write to <a href="mailto:human@mail.firstmove.energy">human@mail.firstmove.energy</a>.
          </p>
          <hr />
          <p>
            Line one
            <br />
            Line two
          </p>
        </body>
      </html>,
    )
    expect(text).toBe(
      [
        "Quick Check result",
        "",
        "Your project is promising.",
        "",
        "- First",
        "- Second",
        "",
        "Heating demand  1.2 GWh/a",
        "Network length  800 m",
        "",
        "See the docs (https://firstmove.energy/en/docs) or write to human@mail.firstmove.energy.",
        "",
        "----",
        "",
        "Line one",
        "Line two",
      ].join("\n"),
    )
  })

  it("keeps injected markup as literal text", () => {
    expect(renderText(<p>{"<script>alert(1)</script>"}</p>)).toBe("<script>alert(1)</script>")
  })
})
