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

    var textView: NSTextView!
    private var pageContainer: NSView!
    weak var delegate: EditorViewControllerDelegate?

    override func loadView() {
        view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupTextView()
    }

    private func setupTextView() {
        // Scroll view with tan background around page
        let scrollView = NSScrollView()
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = false
        scrollView.borderType = .noBorder
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.drawsBackground = true
        scrollView.backgroundColor = NSColor(hex: "#f5f0e8") ?? .lightGray // Tan around page

        // Page container with visible boundaries (8.5" x 11" = 612 x 792 points at 72 DPI)
        // Will be centered in scroll view
        pageContainer = NSView(frame: NSRect(x: 0, y: 0, width: 612, height: 3000))
        pageContainer.wantsLayer = true
        pageContainer.layer?.backgroundColor = NSColor(hex: "#fef5e7")?.cgColor // Cream page
        pageContainer.layer?.borderWidth = 1
        pageContainer.layer?.borderColor = NSColor(hex: "#d4c5b0")?.cgColor
        pageContainer.layer?.shadowColor = NSColor.black.withAlphaComponent(0.15).cgColor
        pageContainer.layer?.shadowOffset = NSSize(width: 0, height: -2)
        pageContainer.layer?.shadowRadius = 8
        pageContainer.layer?.shadowOpacity = 1

        // Text view with 1" margins (72 points)
        let textFrame = pageContainer.bounds.insetBy(dx: 72, dy: 72)
        textView = NSTextView(frame: textFrame)
        textView.minSize = NSSize(width: textFrame.width, height: textFrame.height)
        textView.maxSize = NSSize(width: textFrame.width, height: CGFloat.greatestFiniteMagnitude)
        textView.isVerticallyResizable = true
        textView.isHorizontallyResizable = false
        textView.autoresizingMask = [.width]

        textView.textContainer?.containerSize = NSSize(width: textFrame.width, height: CGFloat.greatestFiniteMagnitude)
        textView.textContainer?.widthTracksTextView = true

        textView.isRichText = true
        textView.importsGraphics = true
        textView.allowsUndo = true
        textView.isAutomaticQuoteSubstitutionEnabled = true
        textView.isAutomaticDashSubstitutionEnabled = true
        textView.isAutomaticTextReplacementEnabled = true
        textView.isContinuousSpellCheckingEnabled = true

        textView.backgroundColor = NSColor(hex: "#fef5e7") ?? .white // Cream
        textView.insertionPointColor = NSColor(hex: "#2c3e50") ?? .black // Navy
        textView.textContainerInset = NSSize(width: 0, height: 0)
        textView.delegate = self

        // Set default font and text color
        let font = NSFont(name: "Inter", size: 16) ?? NSFont.systemFont(ofSize: 16)
        textView.font = font
        textView.textColor = NSColor(hex: "#2c3e50")

        // Configure paragraph style
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 6
        paragraphStyle.paragraphSpacing = 12
        textView.defaultParagraphStyle = paragraphStyle
        textView.typingAttributes = [
            .font: font,
            .foregroundColor: NSColor(hex: "#2c3e50") ?? NSColor.black,
            .paragraphStyle: paragraphStyle
        ]

        pageContainer.addSubview(textView)

        // Center the page container in a larger document view
        let documentView = NSView()
        documentView.addSubview(pageContainer)

        scrollView.documentView = documentView
        view.addSubview(scrollView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        // Center page horizontally when scroll view is wide enough
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

    func scrollToTop() {
        textView.scrollToBeginningOfDocument(nil)
    }

    private func updatePageCentering() {
        guard let scrollView = textView.enclosingScrollView?.enclosingScrollView,
              let documentView = scrollView.documentView else { return }

        let scrollWidth = scrollView.bounds.width
        let pageWidth: CGFloat = 612

        if scrollWidth > pageWidth {
            let xOffset = (scrollWidth - pageWidth) / 2
            pageContainer.frame.origin.x = xOffset
        } else {
            pageContainer.frame.origin.x = 0
        }

        documentView.frame = NSRect(x: 0, y: 0,
                                    width: max(scrollWidth, pageWidth),
                                    height: pageContainer.frame.height)
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        updatePageCentering()
    }

    func getStats() -> (wordCount: Int, charCount: Int) {
        let text = textView.string
        let words = text.components(separatedBy: .whitespacesAndNewlines).filter { !$0.isEmpty }
        let chars = text.count
        return (words.count, chars)
    }
}

extension EditorViewController: NSTextViewDelegate {
    func textDidChange(_ notification: Notification) {
        delegate?.textDidChange()

        // Grow page container as needed
        let contentHeight = textView.layoutManager?.usedRect(for: textView.textContainer!).height ?? 0
        let minPageHeight: CGFloat = 792 // Standard page height
        let neededHeight = max(minPageHeight, contentHeight + 144) // 144 = 72pt margins top+bottom

        if pageContainer.frame.height < neededHeight {
            pageContainer.frame.size.height = neededHeight
        }
    }
}
