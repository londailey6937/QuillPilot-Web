//
//  MainWindowController.swift
//  QuillPilot
//
//  Created by QuillPilot Team
//  Copyright © 2025 QuillPilot. All rights reserved.
//

import Cocoa

class MainWindowController: NSWindowController {

    private var splitViewController: SplitViewController?

    convenience init() {
        // Create the main window
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1200, height: 800),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window.title = "QuillPilot"
        window.center()
        window.minSize = NSSize(width: 800, height: 600)

        self.init(window: window)

        // Set up split view controller
        splitViewController = SplitViewController()
        window.contentViewController = splitViewController

        // Set up toolbar
        setupToolbar()
    }

    private func setupToolbar() {
        guard let window = window else { return }

        let toolbar = NSToolbar(identifier: "MainToolbar")
        toolbar.delegate = self
        toolbar.displayMode = .iconAndLabel
        toolbar.allowsUserCustomization = true
        toolbar.autosavesConfiguration = true

        window.toolbar = toolbar
        window.toolbarStyle = .unified
    }
}

// MARK: - NSToolbarDelegate
extension MainWindowController: NSToolbarDelegate {

    func toolbar(_ toolbar: NSToolbar, itemForItemIdentifier itemIdentifier: NSToolbarItem.Identifier, willBeInsertedIntoToolbar flag: Bool) -> NSToolbarItem? {

        switch itemIdentifier {
        case .bold:
            let item = NSToolbarItem(itemIdentifier: itemIdentifier)
            item.label = "Bold"
            item.paletteLabel = "Bold"
            item.toolTip = "Make text bold"
            item.isBordered = true
            item.target = splitViewController
            item.action = #selector(SplitViewController.toggleBold(_:))
            item.image = NSImage(systemSymbolName: "bold", accessibilityDescription: "Bold")
            return item

        case .italic:
            let item = NSToolbarItem(itemIdentifier: itemIdentifier)
            item.label = "Italic"
            item.paletteLabel = "Italic"
            item.toolTip = "Make text italic"
            item.isBordered = true
            item.target = splitViewController
            item.action = #selector(SplitViewController.toggleItalic(_:))
            item.image = NSImage(systemSymbolName: "italic", accessibilityDescription: "Italic")
            return item

        case .analyze:
            let item = NSToolbarItem(itemIdentifier: itemIdentifier)
            item.label = "Analyze"
            item.paletteLabel = "Analyze Text"
            item.toolTip = "Analyze text for writing quality"
            item.isBordered = true
            item.target = splitViewController
            item.action = #selector(SplitViewController.analyzeText(_:))
            item.image = NSImage(systemSymbolName: "chart.bar.doc.horizontal", accessibilityDescription: "Analyze")
            return item

        case .toggleSidebar:
            let item = NSToolbarItem(itemIdentifier: itemIdentifier)
            item.label = "Analysis"
            item.paletteLabel = "Toggle Analysis Panel"
            item.toolTip = "Show or hide analysis panel"
            item.isBordered = true
            item.target = splitViewController
            item.action = #selector(SplitViewController.toggleSidebar(_:))
            item.image = NSImage(systemSymbolName: "sidebar.right", accessibilityDescription: "Analysis Panel")
            return item

        default:
            return nil
        }
    }

    func toolbarDefaultItemIdentifiers(_ toolbar: NSToolbar) -> [NSToolbarItem.Identifier] {
        return [
            .bold,
            .italic,
            .space,
            .flexibleSpace,
            .analyze,
            .toggleSidebar
        ]
    }

    func toolbarAllowedItemIdentifiers(_ toolbar: NSToolbar) -> [NSToolbarItem.Identifier] {
        return [
            .bold,
            .italic,
            .space,
            .flexibleSpace,
            .analyze,
            .toggleSidebar
        ]
    }
}

// MARK: - Toolbar Item Identifiers
extension NSToolbarItem.Identifier {
    static let bold = NSToolbarItem.Identifier("bold")
    static let italic = NSToolbarItem.Identifier("italic")
    static let analyze = NSToolbarItem.Identifier("analyze")
    static let toggleSidebar = NSToolbarItem.Identifier("toggleSidebar")
}
