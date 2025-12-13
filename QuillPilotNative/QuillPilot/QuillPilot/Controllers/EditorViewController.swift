//
//  EditorViewController.swift
//  QuillPilot
//
//  Created by QuillPilot Team
//  Copyright © 2025 QuillPilot. All rights reserved.
//

import Cocoa

protocol EditorViewControllerDelegate: AnyObject {
    func textDidChange()
}

class EditorViewController: NSViewController {

    weak var delegate: EditorViewControllerDelegate?
    private var scrollView: NSScrollView!
    private var textView: NSTextView!

    override func loadView() {
        view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        setupTextView()
        configureAppearance()
    }

    private func setupTextView() {
        // Create scroll view
        scrollView = NSScrollView(frame: view.bounds)
        scrollView.autoresizingMask = [.width, .height]
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = false
        scrollView.borderType = .noBorder
        scrollView.drawsBackground = true
        scrollView.backgroundColor = NSColor(hex: "#fef5e7") ?? .white

        // Create text view
        let contentSize = scrollView.contentSize
        let textContainer = NSTextContainer(containerSize: NSSize(width: contentSize.width, height: CGFloat.greatestFiniteMagnitude))
        textContainer.widthTracksTextView = true

        let layoutManager = NSLayoutManager()
        layoutManager.addTextContainer(textContainer)

        let textStorage = NSTextStorage()
        textStorage.addLayoutManager(layoutManager)

        textView = NSTextView(frame: .zero, textContainer: textContainer)
        textView.autoresizingMask = [.width]
        textView.isVerticallyResizable = true
        textView.isHorizontallyResizable = false
        textView.isRichText = true
        textView.allowsUndo = true
        textView.delegate = self
        textView.isAutomaticQuoteSubstitutionEnabled = true
        textView.isAutomaticDashSubstitutionEnabled = true
        textView.isAutomaticSpellingCorrectionEnabled = true
        textView.isContinuousSpellCheckingEnabled = true

        // Set text insets for comfortable writing
        textView.textContainerInset = NSSize(width: 40, height: 40)

        // Configure text appearance
        textView.backgroundColor = NSColor(hex: "#fef5e7") ?? .white
        textView.insertionPointColor = NSColor(hex: "#2c3e50") ?? .black

        scrollView.documentView = textView
        view.addSubview(scrollView)

        // Set default font and color
        setDefaultTextAttributes()
    }

    private func setDefaultTextAttributes() {
        let font = NSFont(name: "Inter", size: 16) ?? NSFont.systemFont(ofSize: 16)
        let color = NSColor(hex: "#2c3e50") ?? .black
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 6.0
        paragraphStyle.paragraphSpacing = 12.0

        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: color,
            .paragraphStyle: paragraphStyle
        ]

        textView.typingAttributes = attributes

        // Add placeholder text
        let placeholderText = "Start writing your story...\n\nQuillPilot will analyze your text for:\n• Paragraph length and pacing\n• Passive voice usage\n• Sensory detail suggestions\n\nClick the Analyze button in the toolbar to see detailed feedback."
        textView.string = placeholderText
    }

    private func configureAppearance() {
        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor(hex: "#fef5e7")?.cgColor
    }

    // MARK: - Public Methods

    func toggleBold() {
        guard let font = textView.font else { return }

        let fontManager = NSFontManager.shared
        let newFont: NSFont

        if font.fontDescriptor.symbolicTraits.contains(.bold) {
            newFont = fontManager.convert(font, toNotHaveTrait: .boldFontMask)
        } else {
            newFont = fontManager.convert(font, toHaveTrait: .boldFontMask)
        }

        textView.font = newFont
        updateTypingAttributes(font: newFont)
    }

    func toggleItalic() {
        guard let font = textView.font else { return }

        let fontManager = NSFontManager.shared
        let newFont: NSFont

        if font.fontDescriptor.symbolicTraits.contains(.italic) {
            newFont = fontManager.convert(font, toNotHaveTrait: .italicFontMask)
        } else {
            newFont = fontManager.convert(font, toHaveTrait: .italicFontMask)
        }

        textView.font = newFont
        updateTypingAttributes(font: newFont)
    }

    
    func scrollToTop() {
        textView.scrollToBeginningOfDocument(nil)
    }
    func getTextContent() -> String? {
        return textView.string
    }

    private func updateTypingAttributes(font: NSFont) {
        var attributes = textView.typingAttributes
        attributes[.font] = font
        textView.typingAttributes = attributes
    }
}

// MARK: - NSTextViewDelegate
extension EditorViewController: NSTextViewDelegate {
    func textDidChange(_ notification: Notification) {
        delegate?.textDidChange()
    }
}

// MARK: - NSColor Extension for Hex Colors
extension NSColor {
    convenience init?(hex: String) {
        let r, g, b: CGFloat

        let start = hex.index(hex.startIndex, offsetBy: hex.hasPrefix("#") ? 1 : 0)
        let hexColor = String(hex[start...])

        guard hexColor.count == 6 else {
            return nil
        }

        let scanner = Scanner(string: hexColor)
        var hexNumber: UInt64 = 0

        guard scanner.scanHexInt64(&hexNumber) else {
            return nil
        }

        r = CGFloat((hexNumber & 0xff0000) >> 16) / 255
        g = CGFloat((hexNumber & 0x00ff00) >> 8) / 255
        b = CGFloat(hexNumber & 0x0000ff) / 255

        self.init(red: r, green: g, blue: b, alpha: 1.0)
    }
}
