<!-- source: Challenge_ALG_Quick-Check-Tool/ALG_Hackathon_Challenge_5GDHC-QC.docx (= ALG_Hackathon_Challenge_5GDHC-QC.pdf = doc2.md). The section "Testing & Validation" comes from HackathonChallenge_5GDHC-Assessment-Tool (1) (1).pdf, which is otherwise identical. Spelling fixes logged in SOURCES.md. -->

# Develop a 5GDHC Quick Check Tool

## Overview and Scope

- Develop a functional prototype of a predefined 5GDHC Quick Check Tool
- Translate an existing calculation concept into a digital prototype
- Create an intuitive and user-friendly interface
- Enable municipalities, energy service providers and other project initiators to assess the viability of a 5GDHC Network for a given project area
- Provide a first assessment of the technical and economic potential of a 5GDHC network for a given project area
- Visualize the key results and the main factors influencing the assessment
- Test the tool with predefined project scenarios
- Identify technical, data-related and usability issues for further development

## Outside of Scope

- Development of a new calculation and assessment methodology
- Develop interfaces and data query routines to publicly accessible external databases

## Context

A 5GDHC Network is a low-temperature system that supplies buildings with heating and cooling. Water circulates at around 5-25°C and therefore enables an efficient use of renewable energy and waste heat without requiring insulated pipes. The network connects buildings with energy sources and thermal storage systems, such as borehole fields, buffer tanks, or seasonal storage. Each building uses a heat pump to provide heating or cooling. A key advantage is the bidirectional energy exchange: excess heat can be fed back into the network and used by other buildings, improving overall energy efficiency and sustainability.

Beyond increased sustainability, 5GDHC networks can also contribute to a resilient, secure and locally available energy supply due to the integration of local energy sources, reduced dependence on individual energy carriers and flexible thermal energy exchange and storage.

5GDHC networks can be implemented in different settlement and building typologies and require suitable technical and economic conditions. Practical tools can support municipalities, energy service providers and other actors in identifying suitable areas and assessing their technical and economic potential.

## Challenge Description and Problem Statement

This challenge focuses on the development of a functional prototype of a 5GDHC Quick Check Tool based on an existing concept and predefined calculation and assessment methodology. The underlying calculation approach, relevant parameters and assumptions will be provided at the beginning of the challenge.

The task is to translate this concept into a practical, user-friendly digital tool that enables users to enter key project parameters and quickly assess whether a 5GDHC network appears promising for a specific project area and which factors are decisive for the result. The prototype should implement the predefined calculation and assessment logic, provide clear and comprehensible results, and support an efficient initial screening of potential projects. The focus of the challenge is therefore not on developing a new methodology, but on creating a functional and intuitive digital implementation of the existing concept.

## The Challenge

Develop a functional prototype of the predefined 5GDHC Quick Check Tool.

The calculation and assessment methodology, input parameters, assumptions and required outputs will be provided. An exemplary workflow is listed below:

1. Get familiar with the existing concept
2. Translate the calculation and assessment logic into a digital application
3. Develop an intuitive user interface
4. Implement the calculation and assessment logic
5. Integrate predefined mockup datasets and assumptions
6. Generate clear outputs and visualizations
7. Test the tool using predefined project scenarios
8. Refine the prototype based on testing and feedback

The final prototype should allow a user to:

Input project data → Run a Quick Check → Receive an assessment → Understand the key factors influencing the result → Receive an output document (e.g. PDF)

The overall result shall be communicated through a simple overall assessment such as:

- Promising
- Further analysis required
- Not promising

Since the tool provides only a pre-assessment, the indicator is intentionally broad to avoid false precision and to clearly communicate that the result is a general initial assessment, not a detailed feasibility study. In addition to the overall indicator, the tool should show the main reasons for the assessment, for example relevant technical and economic factors.

For example, the overall result could look like this:

- Promising – High heat demand density, suitable local heat source available, Investment costs within predefined range

## Interim Pitch

- 3-minute pitch per team
- Short demonstration of the current prototype
- Feedback session

## Testing & Validation

*This section exists only in `HackathonChallenge_5GDHC-Assessment-Tool (1) (1).pdf`.*

With predefined reference scenarios, it shall be verified:

- Correct implementation of the calculation and assessment logic
- Correct handling of input parameters
- Plausibility of outputs
- Comprehensibility of the assessment
- Usability for the defined target groups

The scenarios should include different types of cases, for example a clearly promising case, a borderline case and a case with unfavorable conditions.

## Final Prototype

At the end of the development sprint, teams should have a working prototype that can be demonstrated using the predefined project scenarios. The prototype can be developed using appropriate technology or platform, e.g.:

- Web application
- Python-based application
- Dashboard
- No-code / low-code platform

The technology used is secondary to the functionality and usability of the resulting tool.

## Final Pitch & Demo

The final presentation should focus on the developed tool and include a live demo of the Quick Check.

Teams should briefly demonstrate:

- How users enter project data
- How the assessment is generated
- How the results are communicated
- How the tool helps users understand the main factors influencing the assessment

## Evaluation Criteria

The prototypes will be assessed based on:

- Correct implementation of the calculation and assessment methodology
- Usability for the intended target groups
- Clarity and comprehensibility of the results
- Practical applicability as an initial project screening tool

## Expected Outcome

At the end of the hackathon, each team should have developed a functional prototype of the 5GDHC Quick Check Tool based on the predefined concept and calculation and assessment methodology. The prototype should demonstrate how the existing methodology can be transformed into a practical digital tool that allows users to enter project data, assess relevant technical and economic parameters and receive a clear initial assessment of the potential of a 5GDHC Network for the specific project area. The tool should help municipalities, energy service providers and other project initiators to identify promising projects as well as issues requiring further investigation. The focus of the hackathon is not to develop a new concept or methodology, but to build the most useful, understandable and practical digital implementation of the existing concept.
