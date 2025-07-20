/**
 * CodeForge IDE - Web-Based C Programming Environment
 * A complete IDE implementation with syntax highlighting, file management, and C compilation simulation
 */

class CodeForgeIDE {
    constructor() {
        // IDE State Management
        this.files = new Map();
        this.currentFile = 'main.c';
        this.theme = 'dark';
        this.isHelpVisible = false;
        this.fileCounter = 1;
        
        // Sample programs data
        this.samplePrograms = [
            {
                name: "Hello World",
                code: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
            },
            {
                name: "Basic Calculator", 
                code: "#include <stdio.h>\n\nint main() {\n    int a = 10, b = 5;\n    printf(\"Addition: %d + %d = %d\\n\", a, b, a + b);\n    printf(\"Subtraction: %d - %d = %d\\n\", a, b, a - b);\n    printf(\"Multiplication: %d * %d = %d\\n\", a, b, a * b);\n    printf(\"Division: %d / %d = %d\\n\", a, b, a / b);\n    return 0;\n}"
            },
            {
                name: "For Loop Example",
                code: "#include <stdio.h>\n\nint main() {\n    printf(\"Counting from 1 to 5:\\n\");\n    for(int i = 1; i <= 5; i++) {\n        printf(\"%d \", i);\n    }\n    printf(\"\\n\");\n    return 0;\n}"
            },
            {
                name: "Functions Example",
                code: "#include <stdio.h>\n\nint add(int x, int y) {\n    return x + y;\n}\n\nint main() {\n    int result = add(15, 25);\n    printf(\"15 + 25 = %d\\n\", result);\n    return 0;\n}"
            }
        ];

        // Initialize IDE
        this.initializeElements();
        this.setupEventListeners();
        this.initializeFiles();
        this.updateTheme();
        this.updateLineNumbers();
        this.updateFileCount();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Editor elements
        this.codeEditor = document.getElementById('codeEditor');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.currentFileName = document.getElementById('currentFileName');
        this.cursorPosition = document.getElementById('cursorPosition');
        
        // UI elements
        this.consoleOutput = document.getElementById('consoleOutput');
        this.fileTree = document.getElementById('fileTree');
        this.exampleList = document.getElementById('exampleList');
        this.helpPanel = document.getElementById('helpPanel');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Status elements
        this.statusMessage = document.getElementById('statusMessage');
        this.fileCount = document.getElementById('fileCount');
        this.themeIndicator = document.getElementById('themeIndicator');
        
        // Button elements
        this.compileBtn = document.getElementById('compileBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.helpBtn = document.getElementById('helpBtn');
        this.clearConsole = document.getElementById('clearConsole');
        this.createFileBtn = document.getElementById('createFileBtn');
        this.closeHelp = document.getElementById('closeHelp');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Editor events
        this.codeEditor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.highlightSyntax();
            this.updateStatus('Modified');
        });
        
        this.codeEditor.addEventListener('keyup', () => {
            this.updateCursorPosition();
        });
        
        this.codeEditor.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        this.codeEditor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.codeEditor.scrollTop;
        });

        // Button events
        this.compileBtn.addEventListener('click', () => this.compileAndRun());
        this.newFileBtn.addEventListener('click', () => this.createNewFile());
        this.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.helpBtn.addEventListener('click', () => this.toggleHelp());
        this.clearConsole.addEventListener('click', () => this.clearConsoleOutput());
        this.createFileBtn.addEventListener('click', () => this.createNewFile());
        this.closeHelp.addEventListener('click', () => this.toggleHelp());

        // File tree events
        this.fileTree.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-item') || e.target.closest('.file-item')) {
                const fileItem = e.target.closest('.file-item') || e.target;
                const fileName = fileItem.dataset.file;
                if (fileName && !e.target.classList.contains('delete-btn')) {
                    this.switchToFile(fileName);
                }
            }
            
            if (e.target.classList.contains('delete-btn')) {
                const fileName = e.target.dataset.file;
                this.deleteFile(fileName);
            }
        });

        // Example programs events
        this.exampleList.addEventListener('click', (e) => {
            if (e.target.classList.contains('example-item')) {
                const exampleIndex = parseInt(e.target.dataset.example);
                this.loadExample(exampleIndex);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentFile();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.createNewFile();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.compileAndRun();
                        break;
                }
            }
        });

        // Handle tab key in editor
        this.codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.codeEditor.selectionStart;
                const end = this.codeEditor.selectionEnd;
                
                this.codeEditor.value = this.codeEditor.value.substring(0, start) + 
                    '    ' + this.codeEditor.value.substring(end);
                
                this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
                this.updateLineNumbers();
            }
        });
    }

    /**
     * Initialize files with default content
     */
    initializeFiles() {
        const defaultCode = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
        
        this.files.set('main.c', defaultCode);
        this.codeEditor.value = defaultCode;
        this.updateStatus('Ready');
    }

    /**
     * Update line numbers display
     */
    updateLineNumbers() {
        const lines = this.codeEditor.value.split('\n');
        const lineCount = lines.length;
        let lineNumbersHTML = '';
        
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += i + '\n';
        }
        
        this.lineNumbers.textContent = lineNumbersHTML;
    }

    /**
     * Update cursor position display
     */
    updateCursorPosition() {
        const cursorPos = this.codeEditor.selectionStart;
        const textBeforeCursor = this.codeEditor.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        this.cursorPosition.textContent = `Ln ${currentLine}, Col ${currentColumn}`;
    }

    /**
     * Basic syntax highlighting for C code
     */
    highlightSyntax() {
        // Note: This is a simplified approach. In a production IDE, 
        // you'd use a proper syntax highlighting library like CodeMirror or Monaco Editor
        const code = this.codeEditor.value;
        
        // C keywords
        const keywords = [
            'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
            'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
            'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
            'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'
        ];
        
        // This is a placeholder for syntax highlighting
        // In a real implementation, you would apply highlighting to a separate display layer
        // For now, we'll just store this for potential future enhancement
        this.currentSyntax = { keywords, code };
    }

    /**
     * Compile and run C code (simulated)
     */
    async compileAndRun() {
        this.showLoading();
        this.updateStatus('Compiling...');
        
        try {
            // Save current file content
            this.files.set(this.currentFile, this.codeEditor.value);
            
            // Simulate compilation delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const code = this.codeEditor.value;
            const output = this.simulateCompilation(code);
            
            this.displayOutput(output);
            this.updateStatus('Compilation completed');
            
        } catch (error) {
            this.displayError(`Compilation failed: ${error.message}`);
            this.updateStatus('Compilation failed');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Simulate C code compilation and execution
     */
    simulateCompilation(code) {
        try {
            // Check for basic syntax errors
            if (!code.includes('#include')) {
                throw new Error('Missing #include directive');
            }
            
            if (!code.includes('main')) {
                throw new Error('Missing main function');
            }
            
            // Extract printf statements and simulate output
            const printfMatches = code.match(/printf\s*\(\s*"([^"]+)"/g);
            let output = '';
            
            if (printfMatches) {
                printfMatches.forEach(match => {
                    // Extract the string content from printf
                    const stringMatch = match.match(/printf\s*\(\s*"([^"]+)"/);
                    if (stringMatch) {
                        let printString = stringMatch[1];
                        // Handle escape sequences
                        printString = printString.replace(/\\n/g, '\n')
                                               .replace(/\\t/g, '\t')
                                               .replace(/\\"/g, '"')
                                               .replace(/\\\\/g, '\\');
                        output += printString;
                    }
                });
            }
            
            // Handle simple calculations for calculator example
            if (code.includes('a + b') && code.includes('int a = 10, b = 5')) {
                output = 'Addition: 10 + 5 = 15\nSubtraction: 10 - 5 = 5\nMultiplication: 10 * 5 = 50\nDivision: 10 / 5 = 2\n';
            }
            
            // Handle loop example
            if (code.includes('for(int i = 1; i <= 5; i++)')) {
                output = 'Counting from 1 to 5:\n1 2 3 4 5 \n';
            }
            
            // Handle function example
            if (code.includes('add(15, 25)')) {
                output = '15 + 25 = 40\n';
            }
            
            // Default hello world
            if (!output && code.includes('Hello, World!')) {
                output = 'Hello, World!\n';
            }
            
            if (!output) {
                output = 'Program executed successfully (no output).\n';
            }
            
            return {
                success: true,
                output: output,
                exitCode: 0
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                exitCode: 1
            };
        }
    }

    /**
     * Display compilation output
     */
    displayOutput(result) {
        const timestamp = new Date().toLocaleTimeString();
        let outputHTML = `<div class="console-info">[${timestamp}] Compilation started...</div>\n`;
        
        if (result.success) {
            outputHTML += `<div class="console-success">[${timestamp}] Compilation successful!</div>\n`;
            outputHTML += `<div class="console-info">[${timestamp}] Running program...</div>\n`;
            outputHTML += `<div class="console-success">--- Program Output ---</div>\n`;
            outputHTML += `<div>${result.output}</div>`;
            outputHTML += `<div class="console-success">--- End of Output ---</div>\n`;
            outputHTML += `<div class="console-info">[${timestamp}] Program exited with code ${result.exitCode}</div>\n`;
        } else {
            outputHTML += `<div class="console-error">[${timestamp}] Compilation failed!</div>\n`;
            outputHTML += `<div class="console-error">Error: ${result.error}</div>\n`;
        }
        
        this.consoleOutput.innerHTML = outputHTML;
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    /**
     * Display error message
     */
    displayError(message) {
        const timestamp = new Date().toLocaleTimeString();
        const errorHTML = `<div class="console-error">[${timestamp}] ${message}</div>\n`;
        this.consoleOutput.innerHTML += errorHTML;
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    /**
     * Create a new file
     */
    createNewFile() {
        const fileName = prompt('Enter file name (e.g., program.c):');
        if (fileName && fileName.trim()) {
            const cleanFileName = fileName.trim();
            if (this.files.has(cleanFileName)) {
                alert('File already exists!');
                return;
            }
            
            this.files.set(cleanFileName, '// New C file\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}');
            this.addFileToTree(cleanFileName);
            this.switchToFile(cleanFileName);
            this.updateFileCount();
            this.updateStatus(`Created ${cleanFileName}`);
        }
    }

    /**
     * Add file to file tree display
     */
    addFileToTree(fileName) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.file = fileName;
        fileItem.innerHTML = `
            <span class="file-icon">📄</span>
            <span class="file-name">${fileName}</span>
            <button class="delete-btn" data-file="${fileName}">×</button>
        `;
        
        this.fileTree.appendChild(fileItem);
    }

    /**
     * Delete a file
     */
    deleteFile(fileName) {
        if (this.files.size <= 1) {
            alert('Cannot delete the last file!');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${fileName}?`)) {
            this.files.delete(fileName);
            
            // Remove from UI
            const fileItem = this.fileTree.querySelector(`[data-file="${fileName}"]`);
            if (fileItem) {
                fileItem.remove();
            }
            
            // If deleting current file, switch to another file
            if (this.currentFile === fileName) {
                const remainingFiles = Array.from(this.files.keys());
                this.switchToFile(remainingFiles[0]);
            }
            
            this.updateFileCount();
            this.updateStatus(`Deleted ${fileName}`);
        }
    }

    /**
     * Switch to a different file
     */
    switchToFile(fileName) {
        // Save current file
        if (this.currentFile) {
            this.files.set(this.currentFile, this.codeEditor.value);
        }
        
        // Update UI
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const newFileItem = this.fileTree.querySelector(`[data-file="${fileName}"]`);
        if (newFileItem) {
            newFileItem.classList.add('active');
        }
        
        // Load new file
        this.currentFile = fileName;
        this.codeEditor.value = this.files.get(fileName) || '';
        this.currentFileName.textContent = fileName;
        
        this.updateLineNumbers();
        this.updateCursorPosition();
        this.highlightSyntax();
        this.updateStatus(`Opened ${fileName}`);
    }

    /**
     * Save current file
     */
    saveCurrentFile() {
        this.files.set(this.currentFile, this.codeEditor.value);
        this.updateStatus(`Saved ${this.currentFile}`);
        
        // Simulate save animation
        this.saveBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.saveBtn.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * Load example program
     */
    loadExample(index) {
        if (index >= 0 && index < this.samplePrograms.length) {
            const example = this.samplePrograms[index];
            this.codeEditor.value = example.code;
            this.files.set(this.currentFile, example.code);
            
            this.updateLineNumbers();
            this.highlightSyntax();
            this.updateStatus(`Loaded example: ${example.name}`);
            
            // Add visual feedback
            const exampleItem = document.querySelector(`[data-example="${index}"]`);
            exampleItem.style.backgroundColor = 'var(--color-primary)';
            exampleItem.style.color = 'var(--color-btn-primary-text)';
            setTimeout(() => {
                exampleItem.style.backgroundColor = '';
                exampleItem.style.color = '';
            }, 500);
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.updateTheme();
    }

    /**
     * Update theme
     */
    updateTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.theme);
        
        const themeBtn = this.themeToggle;
        if (this.theme === 'dark') {
            themeBtn.innerHTML = '<span class="btn-icon">🌙</span>Dark';
            this.themeIndicator.textContent = 'Dark Mode';
        } else {
            themeBtn.innerHTML = '<span class="btn-icon">☀️</span>Light';
            this.themeIndicator.textContent = 'Light Mode';
        }
    }

    /**
     * Toggle help panel
     */
    toggleHelp() {
        this.isHelpVisible = !this.isHelpVisible;
        
        if (this.isHelpVisible) {
            this.helpPanel.classList.remove('hidden');
            this.helpBtn.innerHTML = '<span class="btn-icon">❌</span>Close Help';
        } else {
            this.helpPanel.classList.add('hidden');
            this.helpBtn.innerHTML = '<span class="btn-icon">❓</span>Help';
        }
    }

    /**
     * Clear console output
     */
    clearConsoleOutput() {
        this.consoleOutput.innerHTML = '<div class="console-welcome">Console cleared. Ready for new output.</div>';
        this.updateStatus('Console cleared');
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * Update status message
     */
    updateStatus(message) {
        this.statusMessage.textContent = message;
        
        // Auto-clear status after 3 seconds
        setTimeout(() => {
            if (this.statusMessage.textContent === message) {
                this.statusMessage.textContent = 'Ready';
            }
        }, 3000);
    }

    /**
     * Update file count display
     */
    updateFileCount() {
        const count = this.files.size;
        this.fileCount.textContent = `${count} file${count !== 1 ? 's' : ''}`;
    }
}

// Initialize IDE when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeForgeIDE = new CodeForgeIDE();
    
    // Add mobile responsiveness
    const handleMobileView = () => {
        const isMobile = window.innerWidth <= 640;
        const sidebar = document.querySelector('.sidebar');
        const helpPanel = document.querySelector('.help-panel');
        
        if (isMobile) {
            // Add mobile menu toggle functionality
            const createMobileToggle = (element, className) => {
                const toggle = document.createElement('button');
                toggle.className = 'btn btn--sm mobile-toggle';
                toggle.textContent = className === 'sidebar' ? '📁' : '❓';
                toggle.addEventListener('click', () => {
                    element.classList.toggle('mobile-open');
                });
                return toggle;
            };
            
            // Add mobile toggles if they don't exist
            if (!document.querySelector('.mobile-toggle-sidebar')) {
                const sidebarToggle = createMobileToggle(sidebar, 'sidebar');
                sidebarToggle.classList.add('mobile-toggle-sidebar');
                document.querySelector('.toolbar').prepend(sidebarToggle);
            }
        }
    };
    
    // Handle window resize
    window.addEventListener('resize', handleMobileView);
    handleMobileView();
    
    // Add welcome message
    setTimeout(() => {
        window.codeForgeIDE.updateStatus('Welcome to CodeForge IDE! Start coding...');
    }, 1000);
});