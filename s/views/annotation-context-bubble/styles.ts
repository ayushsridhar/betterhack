import {css} from "@benev/slate"

export const styles = css`
	.annotation-context-bubble {
		position: fixed;
		z-index: 10001;
		min-width: 200px;
		max-width: 280px;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 0.75em;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		color: #e0e0e0;
		font-size: 12px;
	}

	.annotation-context-bubble .header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5em;
		padding-bottom: 0.4em;
		border-bottom: 1px solid #333;
	}

	.annotation-context-bubble .header h3 {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
	}

	.annotation-context-bubble .close {
		background: none;
		border: none;
		color: #888;
		cursor: pointer;
		padding: 0.2em;
		line-height: 1;
		font-size: 16px;
	}

	.annotation-context-bubble .close:hover {
		color: #fff;
	}

	.annotation-context-bubble .field {
		margin-bottom: 0.6em;
	}

	.annotation-context-bubble .field label {
		display: block;
		margin-bottom: 0.25em;
		color: #aaa;
	}

	.annotation-context-bubble .field select {
		width: 100%;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 0.4em;
		color: inherit;
		font-size: 12px;
		cursor: pointer;
	}

	.annotation-context-bubble .field input[type="text"],
	.annotation-context-bubble .field textarea {
		width: 100%;
		box-sizing: border-box;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 0.4em;
		color: inherit;
		font-size: 12px;
	}

	.annotation-context-bubble .field textarea {
		min-height: 60px;
		resize: vertical;
	}

	.annotation-context-bubble .buttons {
		display: flex;
		gap: 0.4em;
		flex-wrap: wrap;
	}

	.annotation-context-bubble .buttons button {
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 0.35em 0.6em;
		color: inherit;
		font-size: 11px;
		cursor: pointer;
	}

	.annotation-context-bubble .buttons button[data-selected] {
		background: #3a5a8a;
		border-color: #4a6a9a;
	}

	.annotation-context-bubble .buttons button:hover {
		background: #333;
	}
`
