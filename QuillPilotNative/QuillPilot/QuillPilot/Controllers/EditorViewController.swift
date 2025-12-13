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

    private let standardMargin: CGFloat = 72
    private let standardIndentStep: CGFloat = 36

    var textView: NSTextView!

    private var pageContainer: NSView!
    private var scrollView: NSScrollView!
    private var documentView: NSView!
    private var currentTheme: AppTheme = ThemeManager.shared.currentTheme

    weak var delegate: EditorViewControllerDelegate?

    override func loadView() {
        view = NSView()
        view.wantsLayer = true
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupTextView()
    }

    private func setupTextView() {
        scrollView = NSScrollView()
        scrollView.hasVerticalScroller = false
        scrollView.hasHorizontalScroller = false
        scrollView.borderType = .noBorder
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.drawsBackground = true
        scrollView.contentInsets = NSEdgeInsets(top: 50, left: 12, bottom: 50, right: 12)

        pageContainer = NSView(frame: NSRect(x: 0, y: 0, width: 612, height: 3000))
        pageContainer.wantsLayer = true
        pageContainer.layer?.borderWidth = 1
        pageContainer.layer?.masksToBounds = false
        pageContainer.layer?.shadowOpacity = 0.35
        pageContainer.layer?.shadowOffset = NSSize(width: 0, height: 2)
        pageContainer.layer?.shadowRadius = 10

        let textFrame = pageContainer.bounds.insetBy(dx: standardMargin, dy: standardMargin)
        textView = NSTextView(frame: textFrame)
        textView.minSize = NSSize(width: textFrame.width, height: textFrame.height)
        textView.maxSize = NSSize(width: textFrame.width, height: .greatestFiniteMagnitude)
        textView.isVerticallyResizable = true
        textView.isHorizontallyResizable = false
        textView.autoresizingMask = [.width]
        textView.textContainer?.containerSize = NSSize(width: textFrame.width, height: .greatestFiniteMagnitude)
        textView.textContainer?.widthTracksTextView = true
        textView.isRichText = true
        textView.importsGraphics = true
        textView.allowsUndo = true
        textView.isAutomaticQuoteSubstitutionEnabled = true
        textView.isAutomaticDashSubstitutionEnabled = true
        textView.isAutomaticTextReplacementEnabled = true
        textView.isContinuousSpellCheckingEnabled = true
        textView.textContainerInset = NSSize(width: 0, height: 0)
        textView.delegate = self

        let font = NSFont(name: "Times New Roman", size: 12) ?? NSFont.systemFont(ofSize: 12)
        textView.font = font

        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineHeightMultiple = 2.0  // Double-spacing for manuscript format
        paragraphStyle.paragraphSpacing = 12
        paragraphStyle.firstLineHeadIndent = standardIndentStep  // 0.5" first-line indent
        textView.defaultParagraphStyle = paragraphStyle

        pageContainer.addSubview(textView)

        documentView = NSView()
        documentView.wantsLayer = true
        documentView.addSubview(pageContainer)
        documentView.frame = NSRect(x: 0, y: 0,
                                     width: pageContainer.bounds.width,
                                     height: pageContainer.bounds.height + 100)

        scrollView.documentView = documentView
        view.addSubview(scrollView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        applyTheme(currentTheme)
        updateShadowPath()
        updatePageCentering()
    }

    func getTextContent() -> String? {
        return textView.string
    }

    func toggleBold() {
        guard let selectedRange = textView.selectedRanges.first?.rangeValue else { return }
        let fontManager = NSFontManager.shared
        if let currentFont = textView.font {
            let newFont = fontManager.convert(currentFont, toHaveTrait: .boldFontMask)
            textView.setFont(newFont, range: selectedRange)
        }
    }

    func toggleItalic() {
        guard let selectedRange = textView.selectedRanges.first?.rangeValue else { return }
        let fontManager = NSFontManager.shared
        if let currentFont = textView.font {
            let newFont = fontManager.convert(currentFont, toHaveTrait: .italicFontMask)
            textView.setFont(newFont, range: selectedRange)
        }
    }

    func toggleUnderline() {
        guard let textStorage = textView.textStorage else { return }
        guard let selectedRange = textView.selectedRanges.first?.rangeValue else { return }

        if selectedRange.length == 0 {
            let current = (textView.typingAttributes[.underlineStyle] as? Int) ?? 0
            let next = current == 0 ? NSUnderlineStyle.single.rawValue : 0
            textView.typingAttributes[.underlineStyle] = next == 0 ? nil : next
            return
        }

        var hasUnderline = false
        textStorage.enumerateAttribute(.underlineStyle, in: selectedRange, options: []) { value, _, stop in
            if let intValue = value as? Int, intValue != 0 {
                hasUnderline = true
                stop.pointee = true
            }
        }

        textStorage.beginEditing()
        if hasUnderline {
            textStorage.removeAttribute(.underlineStyle, range: selectedRange)
        } else {
            textStorage.addAttribute(.underlineStyle, value: NSUnderlineStyle.single.rawValue, range: selectedRange)
        }
        textStorage.endEditing()
    }

    func setAlignment(_ alignment: NSTextAlignment) {
        applyParagraphEditsToSelectedParagraphs { style in
            style.alignment = alignment
        }

        if let defaultStyle = (textView.defaultParagraphStyle as? NSMutableParagraphStyle)?.mutableCopy() as? NSMutableParagraphStyle {
            defaultStyle.alignment = alignment
            textView.defaultParagraphStyle = defaultStyle
            refreshTypingAttributesUsingDefaultParagraphStyle()
        }
    }

    func setFontFamily(_ family: String) {
        applyFontChange { current in
            NSFontManager.shared.convert(current, toFamily: family)
        }
    }

    func setFontSize(_ size: CGFloat) {
        applyFontChange { current in
            NSFontManager.shared.convert(current, toSize: size)
        }
    }

    func toggleBulletedList() {
        togglePrefixList(
            isPrefixed: { $0.hasPrefix("• ") },
            makePrefix: { _ in "• " }
        )
    }

    func toggleNumberedList() {
        togglePrefixList(
            isPrefixed: { line in
                let trimmed = line
                guard let dot = trimmed.firstIndex(of: ".") else { return false }
                if dot == trimmed.startIndex { return false }
                let numberPart = trimmed[..<dot]
                return numberPart.allSatisfy { $0.isNumber } && trimmed[trimmed.index(after: dot)...].hasPrefix(" ")
            },
            makePrefix: { index in "\(index + 1). " }
        )
    }

    func insertPageBreak() {
        // Use form feed as a lightweight page-break marker.
        textView.insertText("\u{000C}", replacementRange: textView.selectedRange())
    }

    func scrollToTop() {
        textView.scrollToBeginningOfDocument(nil)
    }

    func indent() {
        adjustIndent(by: standardIndentStep)
    }

    func outdent() {
        adjustIndent(by: -standardIndentStep)
    }

    func setPageMargins(left: CGFloat, right: CGFloat) {
        let leftMargin = max(0, left)
        let rightMargin = max(0, right)

        let availableWidth = max(36, pageContainer.bounds.width - leftMargin - rightMargin)
        let availableHeight = max(36, pageContainer.bounds.height - (standardMargin * 2))

        let newFrame = NSRect(
            x: leftMargin,
            y: standardMargin,
            width: availableWidth,
            height: availableHeight
        )

        textView.frame = newFrame
        textView.minSize = NSSize(width: newFrame.width, height: newFrame.height)
        textView.maxSize = NSSize(width: newFrame.width, height: .greatestFiniteMagnitude)
        textView.textContainer?.containerSize = NSSize(width: newFrame.width, height: .greatestFiniteMagnitude)
        textView.textContainer?.widthTracksTextView = true
        updatePageCentering()
    }

    func setFirstLineIndent(_ indent: CGFloat) {
        applyParagraphEditsToSelectedParagraphs { style in
            style.firstLineHeadIndent = style.headIndent + indent
        }

        if let defaultStyle = (textView.defaultParagraphStyle as? NSMutableParagraphStyle)?.mutableCopy() as? NSMutableParagraphStyle {
            defaultStyle.firstLineHeadIndent = defaultStyle.headIndent + indent
            textView.defaultParagraphStyle = defaultStyle
            refreshTypingAttributesUsingDefaultParagraphStyle()
        }
    }

    func attributedContent() -> NSAttributedString {
        (textView.textStorage?.copy() as? NSAttributedString) ?? NSAttributedString(string: textView.string)
    }

    func plainTextContent() -> String {
        textView.string
    }

    func rtfData() throws -> Data {
        let attributed = attributedContent()
        let fullRange = NSRange(location: 0, length: attributed.length)
        guard let data = attributed.rtf(from: fullRange, documentAttributes: [:]) else {
            throw NSError(domain: "QuillPilot", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to generate RTF."])
        }
        return data
    }

    func pdfData() -> Data {
        pageContainer.dataWithPDF(inside: pageContainer.bounds)
    }

    func setAttributedContent(_ attributed: NSAttributedString) {
        textView.textStorage?.setAttributedString(attributed)
        refreshTypingAttributesUsingDefaultParagraphStyle()
        delegate?.textDidChange()
    }

    func setPlainTextContent(_ text: String) {
        let attributed = NSAttributedString(string: text, attributes: textView.typingAttributes)
        setAttributedContent(attributed)
    }

    private func updatePageCentering() {
        guard let scrollView else { return }

        let availableWidth = scrollView.contentView.bounds.width
        let pageWidth: CGFloat = 612
        let centerOffset = max((availableWidth - pageWidth) / 2, 0)
        pageContainer.frame.origin.x = centerOffset

        let docWidth = max(availableWidth, pageWidth)
        documentView.frame = NSRect(x: 0, y: 0,
                                    width: docWidth,
                                    height: pageContainer.frame.height + 100)
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        updatePageCentering()
    }

    private func updateShadowPath() {
        let rect = CGRect(origin: .zero, size: pageContainer.bounds.size)
        pageContainer.layer?.shadowPath = CGPath(rect: rect, transform: nil)
    }

    func getStats() -> (wordCount: Int, charCount: Int) {
        let text = textView.string
        let words = text.components(separatedBy: .whitespacesAndNewlines).filter { !$0.isEmpty }
        let chars = text.count
        return (words.count, chars)
    }

    func applyTheme(_ theme: AppTheme) {
        currentTheme = theme
        view.layer?.backgroundColor = theme.pageAround.cgColor
        scrollView?.backgroundColor = theme.pageAround
        documentView?.layer?.backgroundColor = theme.pageAround.cgColor
        pageContainer?.layer?.backgroundColor = theme.pageBackground.cgColor
        pageContainer?.layer?.borderColor = theme.pageBorder.cgColor
        let shadowColor = NSColor.black.withAlphaComponent(theme == .day ? 0.3 : 0.65)
        pageContainer?.layer?.shadowColor = shadowColor.cgColor
        textView?.backgroundColor = theme.pageBackground
        textView?.textColor = theme.textColor
        textView?.insertionPointColor = theme.insertionPointColor

        if let font = textView?.font,
           let paragraphStyle = textView?.defaultParagraphStyle {
            textView?.typingAttributes = [
                .font: font,
                .foregroundColor: theme.textColor,
                .paragraphStyle: paragraphStyle
            ]
        }
    }

    private func adjustIndent(by delta: CGFloat) {
        applyParagraphEditsToSelectedParagraphs { style in
            let firstLineDelta = style.firstLineHeadIndent - style.headIndent
            let newHeadIndent = max(0, style.headIndent + delta)
            style.headIndent = newHeadIndent
            style.firstLineHeadIndent = newHeadIndent + firstLineDelta
        }

        if let defaultStyle = (textView.defaultParagraphStyle as? NSMutableParagraphStyle)?.mutableCopy() as? NSMutableParagraphStyle {
            let firstLineDelta = defaultStyle.firstLineHeadIndent - defaultStyle.headIndent
            let newHeadIndent = max(0, defaultStyle.headIndent + delta)
            defaultStyle.headIndent = newHeadIndent
            defaultStyle.firstLineHeadIndent = newHeadIndent + firstLineDelta
            textView.defaultParagraphStyle = defaultStyle
            refreshTypingAttributesUsingDefaultParagraphStyle()
        }
    }

    private func applyParagraphEditsToSelectedParagraphs(_ edit: (NSMutableParagraphStyle) -> Void) {
        guard let textStorage = textView.textStorage else { return }
        guard let selected = textView.selectedRanges.first?.rangeValue else { return }
        let fullText = (textStorage.string as NSString)
        let paragraphsRange = fullText.paragraphRange(for: selected)

        textStorage.beginEditing()
        textStorage.enumerateAttribute(.paragraphStyle, in: paragraphsRange, options: []) { value, range, _ in
            let current = (value as? NSParagraphStyle) ?? textView.defaultParagraphStyle ?? NSParagraphStyle.default
            guard let mutable = current.mutableCopy() as? NSMutableParagraphStyle else { return }
            edit(mutable)
            textStorage.addAttribute(.paragraphStyle, value: mutable, range: range)
        }
        textStorage.endEditing()
    }

    private func refreshTypingAttributesUsingDefaultParagraphStyle() {
        guard let font = textView.font else { return }
        guard let paragraphStyle = textView.defaultParagraphStyle else { return }
        let mutableStyle = (paragraphStyle as? NSMutableParagraphStyle)?.mutableCopy() as? NSMutableParagraphStyle ?? NSMutableParagraphStyle()
        if mutableStyle.lineHeightMultiple == 0 {
            mutableStyle.lineHeightMultiple = 2.0  // Ensure double-spacing
        }
        textView.typingAttributes = [
            .font: font,
            .foregroundColor: currentTheme.textColor,
            .paragraphStyle: mutableStyle
        ]
    }

    private func applyFontChange(_ transform: (NSFont) -> NSFont) {
        guard let textStorage = textView.textStorage else { return }
        let baseFont = (textView.typingAttributes[.font] as? NSFont) ?? textView.font ?? NSFont.systemFont(ofSize: 16)
        guard let selectedRange = textView.selectedRanges.first?.rangeValue else { return }

        if selectedRange.length == 0 {
            let newFont = transform(baseFont)
            textView.font = newFont
            textView.typingAttributes[.font] = newFont
            return
        }

        textStorage.beginEditing()
        textStorage.enumerateAttribute(.font, in: selectedRange, options: []) { value, range, _ in
            let current = (value as? NSFont) ?? baseFont
            let newFont = transform(current)
            textStorage.addAttribute(.font, value: newFont, range: range)
        }
        textStorage.endEditing()

        let newTypingFont = transform(baseFont)
        textView.typingAttributes[.font] = newTypingFont
    }

    private func togglePrefixList(isPrefixed: (String) -> Bool, makePrefix: (Int) -> String) {
        guard let textStorage = textView.textStorage else { return }
        guard let selectedRange = textView.selectedRanges.first?.rangeValue else { return }

        let fullText = textStorage.string as NSString
        let paragraphsRange = fullText.paragraphRange(for: selectedRange)

        var paragraphs: [(range: NSRange, text: String)] = []
        fullText.enumerateSubstrings(in: paragraphsRange, options: [.byParagraphs, .substringNotRequired]) { _, subrange, _, _ in
            let text = fullText.substring(with: subrange)
            paragraphs.append((subrange, text))
        }

        let allPrefixed = paragraphs.allSatisfy { isPrefixed($0.text) || $0.text.isEmpty }

        textStorage.beginEditing()
        for (idx, para) in paragraphs.enumerated().reversed() {
            guard !para.text.isEmpty else { continue }
            if allPrefixed {
                if isPrefixed(para.text) {
                    let prefixLen = (para.text.hasPrefix("• ") ? 2 : (para.text.firstIndex(of: ".") ?? para.text.startIndex).utf16Offset(in: para.text) + 2)
                    let removeRange = NSRange(location: para.range.location, length: min(prefixLen, para.range.length))
                    textStorage.replaceCharacters(in: removeRange, with: "")
                }
            } else {
                let prefix = makePrefix(idx)
                textStorage.replaceCharacters(in: NSRange(location: para.range.location, length: 0), with: prefix)
            }
        }
        textStorage.endEditing()
    }
}

extension EditorViewController: NSTextViewDelegate {
    func textDidChange(_ notification: Notification) {
        delegate?.textDidChange()

        let contentHeight = textView.layoutManager?.usedRect(for: textView.textContainer!).height ?? 0
        let minPageHeight: CGFloat = 792
        let neededHeight = max(minPageHeight, contentHeight + 144)

        if pageContainer.frame.height < neededHeight {
            pageContainer.frame.size.height = neededHeight
            documentView.frame.size.height = neededHeight + 100
            updateShadowPath()
        }
    }
}
