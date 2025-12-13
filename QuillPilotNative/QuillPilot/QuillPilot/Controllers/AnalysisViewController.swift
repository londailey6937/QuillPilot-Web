//
//  AnalysisViewController.swift
//  QuillPilot
//
//  Created by QuillPilot Team
//  Copyright © 2025 QuillPilot. All rights reserved.
//

import Cocoa

// Helper class for flipped coordinate system in scroll views
private class FlippedClipView: NSView {
    override var isFlipped: Bool { return true }
}

class AnalysisViewController: NSViewController {

    private var scrollView: NSScrollView!
    private var stackView: NSStackView!
    private var documentView: FlippedClipView!

    override func loadView() {
        view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    private func setupUI() {
        // Create scroll view
        scrollView = NSScrollView(frame: view.bounds)
        scrollView.autoresizingMask = [.width, .height]
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = false
        scrollView.borderType = .noBorder
        scrollView.drawsBackground = true
        scrollView.backgroundColor = NSColor(hex: "#fffaf3") ?? .white

        // Create a flipped document view to host the stack view
        documentView = FlippedClipView()
        documentView.wantsLayer = true
        
        // Create stack view for analysis results
        stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .leading
        stackView.spacing = 16
        stackView.edgeInsets = NSEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)

        // Add header
        let headerLabel = createLabel("Analysis Results", fontSize: 18, bold: true, color: "#2c3e50")
        stackView.addArrangedSubview(headerLabel)

        // Add placeholder text
        let placeholderLabel = createLabel("Write some text and click Analyze to see results here.", fontSize: 14, bold: false, color: "#6b7280")
        placeholderLabel.maximumNumberOfLines = 0
        stackView.addArrangedSubview(placeholderLabel)

        documentView.addSubview(stackView)
        scrollView.documentView = documentView
        view.addSubview(scrollView)

        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor(hex: "#fffaf3")?.cgColor
        
        // Initial layout
        updateStackViewFrame()
    }
    
    private func updateStackViewFrame() {
        print("🎨 updateStackViewFrame called")
        // Make stack view width match scroll view width
        let scrollWidth = scrollView.contentView.bounds.width
        print("🎨 scrollView.contentView.bounds.width = \(scrollWidth)")
        
        let fittingSize = stackView.fittingSize
        print("🎨 stackView.fittingSize = \(fittingSize)")
        
        stackView.frame = NSRect(x: 0, y: 0, width: scrollWidth, height: fittingSize.height)
        
        // Size document view to contain stack view
        documentView.frame = NSRect(x: 0, y: 0, width: scrollWidth, height: fittingSize.height)
        
        print("🎨 Final stackView.frame = \(stackView.frame)")
        print("🎨 Final documentView.frame = \(documentView.frame)")
    }

    func displayResults(_ results: AnalysisResults) {
        print("📊 displayResults called with wordCount=\(results.wordCount)")
        print("📊 Current stackView.arrangedSubviews.count = \(stackView.arrangedSubviews.count)")
        
        // Clear existing results (except header)
        while stackView.arrangedSubviews.count > 1 {
            if let view = stackView.arrangedSubviews.last {
                stackView.removeArrangedSubview(view)
                view.removeFromSuperview()
            }
        }

        // Word and sentence count
        addStatistic("Total Words", value: "\(results.wordCount)")
        addStatistic("Total Sentences", value: "\(results.sentenceCount)")
        addSeparator()

        // Paragraph analysis
        addSectionHeader("📊 Paragraph Analysis")
        addStatistic("Average Length", value: "\(results.averageParagraphLength) words")
        if !results.longParagraphs.isEmpty {
            addWarning("⚠️ \(results.longParagraphs.count) paragraph(s) may be too long (>150 words)", color: "#f97316")
        }
        addSeparator()

        // Passive voice
        addSectionHeader("🔍 Passive Voice")
        if results.passiveVoiceCount > 0 {
            addWarning("Found \(results.passiveVoiceCount) instance(s) of passive voice", color: "#8b5cf6")
            for phrase in results.passiveVoicePhrases.prefix(5) {
                addBulletPoint("• \"\(phrase)\"")
            }
        } else {
            addSuccess("✓ No passive voice detected")
        }
        addSeparator()

        // Sensory details
        addSectionHeader("🌟 Sensory Details")
        addStatistic("Sensory Words", value: "\(results.sensoryDetailCount)")
        if results.missingSensoryDetail {
            addWarning("Consider adding more sensory details to engage readers", color: "#eab308")
        } else {
            addSuccess("✓ Good use of sensory language")
        }
        
        print("📊 After adding results, stackView.arrangedSubviews.count = \(stackView.arrangedSubviews.count)")
        
        // Update layout after adding content - use async to avoid blocking
        DispatchQueue.main.async { [weak self] in
            self?.updateStackViewFrame()
        }
    }

    // MARK: - UI Helper Methods

    private func addSectionHeader(_ text: String) {
        let label = createLabel(text, fontSize: 15, bold: true, color: "#2c3e50")
        stackView.addArrangedSubview(label)
    }

    private func addStatistic(_ label: String, value: String) {
        let text = "\(label): \(value)"
        let textLabel = createLabel(text, fontSize: 13, bold: false, color: "#374151")
        stackView.addArrangedSubview(textLabel)
    }

    private func addWarning(_ text: String, color: String) {
        let label = createLabel(text, fontSize: 13, bold: false, color: color)
        label.maximumNumberOfLines = 0
        stackView.addArrangedSubview(label)
    }

    private func addSuccess(_ text: String) {
        let label = createLabel(text, fontSize: 13, bold: false, color: "#10b981")
        stackView.addArrangedSubview(label)
    }

    private func addBulletPoint(_ text: String) {
        let label = createLabel(text, fontSize: 12, bold: false, color: "#6b7280")
        label.maximumNumberOfLines = 0
        stackView.addArrangedSubview(label)
    }

    private func addSeparator() {
        let separator = NSBox()
        separator.boxType = .separator
        separator.translatesAutoresizingMaskIntoConstraints = false
        separator.widthAnchor.constraint(equalToConstant: 200).isActive = true
        stackView.addArrangedSubview(separator)
    }

    private func createLabel(_ text: String, fontSize: CGFloat, bold: Bool, color: String) -> NSTextField {
        let label = NSTextField(labelWithString: text)
        label.isEditable = false
        label.isBezeled = false
        label.drawsBackground = false
        label.isSelectable = false

        let font: NSFont
        if bold {
            font = NSFont.boldSystemFont(ofSize: fontSize)
        } else {
            font = NSFont.systemFont(ofSize: fontSize)
        }
        label.font = font

        if let nsColor = NSColor(hex: color) {
            label.textColor = nsColor
        }

        return label
    }
}
