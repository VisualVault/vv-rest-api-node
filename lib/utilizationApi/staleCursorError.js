/**
 * Raised when a load of Utilization data ends the validity of the Cursor a page walk is holding.
 *
 * A Cursor is bound to the DataVersion it was issued under, so a load part way through a walk leaves the
 * remaining pages unreachable. Recovery is to run the walk again from its first page, which re-reads the
 * LoginEvents already delivered.
 */
export class StaleCursorError extends Error {
    /** Builds the error. The message is fixed, so the constructor takes no arguments. */
    constructor() {
        super(
            'The Utilization data was reloaded during this walk, which ended the validity of the Cursor it was ' +
            'holding. The walk must be restarted from its first page.'
        );
        this.name = 'StaleCursorError';
    }
}

export default StaleCursorError;
