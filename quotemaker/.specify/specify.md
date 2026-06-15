# Quote Maker System Requirements

This document specifies the behavior of the Quote Maker web application using EARS (Easy Approach to Requirements Syntax).

## Core Requirements

### Input and Editor Interface
*   `[REQ-QM-EDITOR-01]` The application shall display a split-screen layout with a markdown input editor on the left and a live preview render panel on the right.
*   `[REQ-QM-EDITOR-02]` When the user modifies text in the markdown editor, the application shall immediately re-render the preview using marked markdown parsing.
*   `[REQ-QM-EDITOR-03]` The application shall provide control inputs to adjust:
    *   Header highlight color (default: yellow)
    *   Bold text highlight color (default: neon green)
    *   Underline color (default: red)
    *   Header Font Family and Body Font Family (selected from standard web/Google fonts or custom uploaded fonts)
    *   Header Font Size and Body Font Size sliders, with accompanying "+" and "-" adjustment buttons
    *   Watermark text field and a toggle visibility checkbox
*   `[REQ-QM-EDITOR-04]` When the user works within the Markdown editor, the application shall intercept keyboard shortcuts Ctrl+B/Cmd+B (bold `**`), Ctrl+I/Cmd+I (italic `*`), and Ctrl+U/Cmd+U (underline `<u></u>`) to automatically format selected text.
*   `[REQ-QM-EDITOR-05]` The editor customization sidebar shall exhibit visible scrollbar handles to guarantee access to settings that fall below the screen fold.
*   `[REQ-QM-EDITOR-06]` The customization controls shall feature a reset design button to restore highlight colors, font sizes, and selected font families to their original defaults.

### Preview Panel (3:4 Canvas)
*   `[REQ-QM-PREVIEW-01]` The preview panel shall be constrained and locked to a 3:4 aspect ratio.
*   `[REQ-QM-PREVIEW-02]` The preview panel shall render with the selected background texture choice (defaulting to a paper texture).
*   `[REQ-QM-PREVIEW-03]` The application shall highlight headers (`<h1>`, `<h2>`, etc.) with the configured header highlight color.
*   `[REQ-QM-PREVIEW-04]` The application shall highlight bold text (`<strong>`) with the configured bold highlight color.
*   `[REQ-QM-PREVIEW-05]` The application shall underline underlined text (`<u>`) with the configured underline color.
*   `[REQ-QM-PREVIEW-06]` Where a watermark is enabled, the preview panel shall display the watermark centered at the bottom.

### Custom Font Upload & Storage
*   `[REQ-QM-FONT-01]` When the user uploads a custom font file (`.ttf`, `.otf`, `.woff`, `.woff2`), the application shall store the font binary in IndexedDB.
*   `[REQ-QM-FONT-02]` When the application initializes, it shall load any previously saved custom fonts from IndexedDB and register them in the browser's DocumentFontFaceSet.
*   `[REQ-QM-FONT-03]` The application shall provide an option to delete custom uploaded fonts from local storage.

### Image Download
*   `[REQ-QM-EXPORT-01]` When the user clicks the download button, the application shall export the 3:4 preview canvas as an image file (PNG/JPEG).
*   `[REQ-QM-EXPORT-02]` The exported image shall have a maximum dimension of 2048px (maintaining the 3:4 ratio: 1536px x 2048px) to ensure high resolution.
