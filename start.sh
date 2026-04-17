#!/bin/bash

echo "Starting AgendaFácil..."

cd "$(dirname "$0")/backend" && npm run dev &
BACKEND_PID=$!

cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
