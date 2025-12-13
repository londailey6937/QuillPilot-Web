//
//  MainWindowController.swift
//  QuillPilot
//
//  Created by QuillPilot Team
//  Copyright © 2025 QuillPilot. All rights reserved.
//

import Cocoa

class MainWindowController: NSWindowController {

    private var headerView: HeaderView!
    private var toolbarView: FormattingToolbar!
    private var rulerView: EnhancedRulerView!
    private var mainContentViewController: ContentViewController!

    convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1400, height: 900),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window.title = "QuillPilot"
        window.minSize = NSSize(width: 1000, height: 700)
        window.center()
        window.setFrameAutosaveName("QuillPilotMainWindow")

        self.init(window: window)
        setupUI()
    }

    private func setupUI() {
        guard let window = window else { return }

        // Create main container view
        let containerView = NSView()
        containerView.wantsLayer = true
        containerView.layer?.backgroundColor = NSColor(hex: "#f5f5f5")?.cgColor

        // Create header (logo, title, specs, login) - 60px tall
        headerView = HeaderView()
        headerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(headerView)

        // Create formatting toolbar - 50px tall
        toolbarView = FormattingToolbar()
        toolbarView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(toolbarView)

        // Create ruler - 30px tall
        rulerView = EnhancedRulerView()
        rulerView.pageWidth = 612 // Match page container width
        rulerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(rulerView)

        // Create 3-column content area (outline | editor | analysis)
        mainContentViewController = ContentViewController()
        let contentView = mainContentViewController.view
        contentView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(contentView)

        // Set up constraints
        NSLayoutConstraint.activate([
            // Header at top
            headerView.topAnchor.constraint(equalTo: containerView.topAnchor),
            headerView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            headerView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            headerView.heightAnchor.constraint(equalToConstant: 60),

            // Toolbar below header
            toolbarView.topAnchor.constraint(equalTo: headerView.bottomAnchor),
            toolbarView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            toolbarView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            toolbarView.heightAnchor.constraint(equalToConstant: 50),

            // Ruler below toolbar (full width to match container)
            rulerView.topAnchor.constraint(equalTo: toolbarView.bottomAnchor),
            rulerView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            rulerView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            rulerView.heightAnchor.constraint(equalToConstant: 30),

            // Content fills remaining space
            contentView.topAnchor.constraint(equalTo: rulerView.bottomAnchor),
            contentView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
        ])

        window.contentView = containerView
    }
}

// MARK: - Header View (Logo, Title, Specs, Login)
class HeaderView: NSView {

    private var logoView: AnimatedLogoView!
    private var titleLabel: NSTextField!
    private var specsPanel: DocumentInfoPanel!
    private var themeToggle: NSButton!
    private var loginButton: NSButton!

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        wantsLayer = true
        layer?.backgroundColor = NSColor(hex: "#f5f0e8")?.cgColor

        // Animated logo (left)
        logoView = AnimatedLogoView()
        logoView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(logoView)

        // Title
        titleLabel = NSTextField(labelWithString: "QuillPilot")
        titleLabel.font = NSFont.systemFont(ofSize: 20, weight: .medium)
        titleLabel.textColor = NSColor(hex: "#2c3e50")
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        addSubview(titleLabel)

        // Specs panel (word count, page count, etc.)
        specsPanel = DocumentInfoPanel()
        specsPanel.translatesAutoresizingMaskIntoConstraints = false
        addSubview(specsPanel)

        // Day/Night toggle button
        themeToggle = NSButton(title: "☀️", target: self, action: #selector(toggleTheme(_:)))
        themeToggle.bezelStyle = .rounded
        themeToggle.translatesAutoresizingMaskIntoConstraints = false
        addSubview(themeToggle)

        // Login button (right)
        loginButton = NSButton(title: "Login", target: nil, action: nil)
        loginButton.bezelStyle = .rounded
        loginButton.translatesAutoresizingMaskIntoConstraints = false
        addSubview(loginButton)

        NSLayoutConstraint.activate([
            // Logo at left
            logoView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            logoView.centerYAnchor.constraint(equalTo: centerYAnchor),
            logoView.widthAnchor.constraint(equalToConstant: 40),
            logoView.heightAnchor.constraint(equalToConstant: 40),

            // Title next to logo
            titleLabel.leadingAnchor.constraint(equalTo: logoView.trailingAnchor, constant: 12),
            titleLabel.centerYAnchor.constraint(equalTo: centerYAnchor),

            // Specs panel centered in header
            specsPanel.centerXAnchor.constraint(equalTo: centerXAnchor),
            specsPanel.centerYAnchor.constraint(equalTo: centerYAnchor),
            specsPanel.widthAnchor.constraint(lessThanOrEqualToConstant: 500),

            // Theme toggle before login
            themeToggle.trailingAnchor.constraint(equalTo: loginButton.leadingAnchor, constant: -12),
            themeToggle.centerYAnchor.constraint(equalTo: centerYAnchor),

            // Login button at right
            loginButton.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            loginButton.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }

    @objc func toggleTheme(_ sender: Any?) {
        ThemeManager.shared.toggleTheme()
        print("Theme toggled to: \(ThemeManager.shared.currentTheme)")
    }
}

// MARK: - Animated Logo View
class AnimatedLogoView: NSView {

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        wantsLayer = true
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Draw simple quill feather icon
        guard let context = NSGraphicsContext.current?.cgContext else { return }

        context.setFillColor(NSColor(hex: "#fef5e7")?.cgColor ?? NSColor.white.cgColor)

        // Quill shape (simplified)
        let path = NSBezierPath()
        path.move(to: NSPoint(x: bounds.width * 0.5, y: bounds.height * 0.1))
        path.line(to: NSPoint(x: bounds.width * 0.7, y: bounds.height * 0.9))
        path.line(to: NSPoint(x: bounds.width * 0.5, y: bounds.height * 0.8))
        path.line(to: NSPoint(x: bounds.width * 0.3, y: bounds.height * 0.9))
        path.close()

        NSColor(hex: "#fef5e7")?.setFill()
        path.fill()
    }
}

// MARK: - Specs Panel (Word Count, Page Count)

// MARK: - Formatting Toolbar
class FormattingToolbar: NSView {

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        wantsLayer = true
        layer?.backgroundColor = NSColor(hex: "#f5f0e8")?.cgColor

        // Font family popup
        let fontPopup = NSPopUpButton(frame: .zero, pullsDown: false)
        fontPopup.addItems(withTitles: ["Inter", "Georgia", "Times New Roman", "Arial", "Courier New"])
        fontPopup.translatesAutoresizingMaskIntoConstraints = false

        // Font size controls
        let decreaseSizeBtn = NSButton(title: "−", target: nil, action: nil)
        let sizePopup = NSPopUpButton(frame: .zero, pullsDown: false)
        sizePopup.addItems(withTitles: ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32"])
        sizePopup.selectItem(at: 4) // 12pt default
        let increaseSizeBtn = NSButton(title: "+", target: nil, action: nil)

        // Text styling
        let boldBtn = createToolbarButton("B", weight: .bold)
        let italicBtn = createToolbarButton("I", isItalic: true)
        let underlineBtn = createToolbarButton("U", isUnderlined: true)

        // Alignment
        let alignLeftBtn = createToolbarButton("≡")
        let alignCenterBtn = createToolbarButton("≣")
        let alignRightBtn = createToolbarButton("≡")
        let justifyBtn = createToolbarButton("≣")

        // Lists
        let bulletsBtn = createToolbarButton("•")
        let numberingBtn = createToolbarButton("1.")

        // Layout
        let columnsBtn = NSButton(title: "Columns", target: nil, action: nil)
        let pageBreakBtn = NSButton(title: "Page Break", target: nil, action: nil)

        // Add all to stack view (all aligned left)
        let toolbarStack = NSStackView(views: [
            fontPopup, decreaseSizeBtn, sizePopup, increaseSizeBtn,
            boldBtn, italicBtn, underlineBtn,
            alignLeftBtn, alignCenterBtn, alignRightBtn, justifyBtn,
            bulletsBtn, numberingBtn,
            columnsBtn, pageBreakBtn
        ])
        toolbarStack.orientation = .horizontal
        toolbarStack.spacing = 8
        toolbarStack.edgeInsets = NSEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        toolbarStack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(toolbarStack)

        NSLayoutConstraint.activate([
            toolbarStack.leadingAnchor.constraint(equalTo: leadingAnchor),
            toolbarStack.trailingAnchor.constraint(equalTo: trailingAnchor),
            toolbarStack.topAnchor.constraint(equalTo: topAnchor),
            toolbarStack.bottomAnchor.constraint(equalTo: bottomAnchor)
        ])
    }

    private func createToolbarButton(_ title: String, weight: NSFont.Weight = .regular, isItalic: Bool = false, isUnderlined: Bool = false) -> NSButton {
        let button = NSButton(title: title, target: nil, action: nil)
        button.bezelStyle = .texturedRounded
        button.setButtonType(.momentaryPushIn)

        var font = NSFont.systemFont(ofSize: 14, weight: weight)
        if isItalic {
            font = NSFont(descriptor: font.fontDescriptor.withSymbolicTraits(.italic), size: 14) ?? font
        }
        button.font = font

        return button
    }
}

// MARK: - Ruler View

// MARK: - Content View Controller (3-column layout)
class ContentViewController: NSViewController {

    private var outlineViewController: OutlineViewController!
    private var editorViewController: EditorViewController!
    private var analysisViewController: AnalysisViewController!
    private var backToTopButton: NSButton!

    override func loadView() {
        view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()
    }

    private func setupLayout() {
        // Create 3-column split view
        let splitView = NSSplitView()
        splitView.isVertical = true
        splitView.dividerStyle = .thin
        splitView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(splitView)

        // Left: Outline panel
        outlineViewController = OutlineViewController()
        splitView.addArrangedSubview(outlineViewController.view)
        outlineViewController.view.widthAnchor.constraint(greaterThanOrEqualToConstant: 200).isActive = true
        outlineViewController.view.widthAnchor.constraint(lessThanOrEqualToConstant: 350).isActive = true

        // Center: Editor
        editorViewController = EditorViewController()
        splitView.addArrangedSubview(editorViewController.view)
        editorViewController.view.widthAnchor.constraint(greaterThanOrEqualToConstant: 500).isActive = true
        splitView.setHoldingPriority(.defaultLow - 1, forSubviewAt: 1)

        // Right: Analysis panel
        analysisViewController = AnalysisViewController()
        splitView.addArrangedSubview(analysisViewController.view)
        analysisViewController.view.widthAnchor.constraint(greaterThanOrEqualToConstant: 250).isActive = true
        analysisViewController.view.widthAnchor.constraint(lessThanOrEqualToConstant: 400).isActive = true        // Back to top button (floating)
        backToTopButton = NSButton(title: "↑ Top", target: self, action: #selector(scrollToTop))
        backToTopButton.bezelStyle = .rounded
        backToTopButton.translatesAutoresizingMaskIntoConstraints = false
        backToTopButton.isHidden = true
        view.addSubview(backToTopButton)

        NSLayoutConstraint.activate([
            splitView.topAnchor.constraint(equalTo: view.topAnchor),
            splitView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            splitView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            splitView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            backToTopButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            backToTopButton.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20)
        ])
    }

    @objc private func scrollToTop() {
        // Scroll editor to top
        editorViewController.scrollToTop()
    }
}

// MARK: - Outline View Controller
class OutlineViewController: NSViewController {

    override func loadView() {
        view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor(hex: "#f9f4ed")?.cgColor

        let label = NSTextField(labelWithString: "Document Outline")
        label.font = NSFont.boldSystemFont(ofSize: 14)
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)

        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.topAnchor, constant: 16),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16)
        ])
    }
}
