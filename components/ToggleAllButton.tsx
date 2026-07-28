"use client";

// Ставит/снимает все чекбоксы задач внутри своей формы
export function ToggleAllButton() {
  return (
    <button
      type="button"
      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
      onClick={(e) => {
        const boxes = e.currentTarget
          .closest("form")
          ?.querySelectorAll<HTMLInputElement>('input[name="task"]');
        if (!boxes) return;
        const allChecked = Array.from(boxes).every((b) => b.checked);
        boxes.forEach((b) => (b.checked = !allChecked));
      }}
    >
      выбрать все / снять
    </button>
  );
}
