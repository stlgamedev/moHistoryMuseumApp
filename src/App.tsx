import { useEffect } from "preact/hooks";
import { screen, sections } from "./state/game";
import { loadSectionIndex, loadSection } from "./content/loader";
import { MenuButton } from "./components/MenuButton";
import { Welcome } from "./screens/Welcome";
import { About } from "./screens/About";
import { Credits } from "./screens/Credits";
import { Instructions } from "./screens/Instructions";
import { AgeSelect } from "./screens/AgeSelect";
import { SectionSelect } from "./screens/SectionSelect";
import { Question } from "./screens/Question";
import { Hint } from "./screens/Hint";
import { PatchEarned } from "./screens/PatchEarned";
import { Inventory } from "./screens/Inventory";

export function App() {
  useEffect(() => {
    (async () => {
      try {
        const index = await loadSectionIndex();
        const loaded = await Promise.all(
          index.sections.map((s) => loadSection(s.id, s.path))
        );
        sections.value = loaded;
      } catch (err) {
        console.error("Failed to load content", err);
      }
    })();
  }, []);

  const s = screen.value;

  return (
    <div class="app">
      <MenuButton />
      {s.kind === "welcome" && <Welcome />}
      {s.kind === "about" && <About />}
      {s.kind === "credits" && <Credits />}
      {s.kind === "instructions" && <Instructions />}
      {s.kind === "age-select" && <AgeSelect />}
      {s.kind === "section-select" && <SectionSelect />}
      {s.kind === "question" && <Question sectionId={s.sectionId} questionIndex={s.questionIndex} />}
      {s.kind === "hint" && <Hint sectionId={s.sectionId} questionIndex={s.questionIndex} />}
      {s.kind === "patch-earned" && <PatchEarned sectionId={s.sectionId} />}
      {s.kind === "inventory" && <Inventory />}
    </div>
  );
}
