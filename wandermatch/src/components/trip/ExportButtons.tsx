"use client";

import { useState } from "react";
import { DownloadIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportItem {
  _id: string;
  day: number;
  title: string;
  description?: string;
  category: string;
  order: number;
  startTime?: string;
  endTime?: string;
}

interface ExportButtonsProps {
  tripId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  items: ExportItem[];
}

export default function ExportButtons({ tripId, tripName, destination, startDate, endDate, items }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Generate .ics calendar file
  const handleExportCalendar = () => {
    const start = new Date(startDate);

    const toICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WanderMatch//Trip Itinerary//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n");

    items.forEach((item, idx) => {
      const itemDate = new Date(start);
      itemDate.setDate(itemDate.getDate() + (item.day - 1));

      // Default: all-day style event at 9am
      const dtStart = new Date(itemDate);
      dtStart.setHours(9 + idx * 2, 0, 0, 0);
      const dtEnd = new Date(dtStart);
      dtEnd.setHours(dtStart.getHours() + 2);

      icsContent += "\r\nBEGIN:VEVENT";
      icsContent += `\r\nUID:${tripId}-${item._id}@wandermatch`;
      icsContent += `\r\nDTSTART:${toICSDate(dtStart)}`;
      icsContent += `\r\nDTEND:${toICSDate(dtEnd)}`;
      icsContent += `\r\nSUMMARY:${item.title}`;
      icsContent += `\r\nLOCATION:${destination}`;
      if (item.description) {
        icsContent += `\r\nDESCRIPTION:${item.description.replace(/\n/g, "\\n")}`;
      }
      icsContent += "\r\nEND:VEVENT";
    });

    icsContent += "\r\nEND:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tripName.replace(/\s+/g, "_")}_itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate PDF
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Build a temporary, styled HTML element for capture
      const printEl = document.createElement("div");
      printEl.style.cssText = `
        position: absolute; left: -9999px; top: 0; 
        width: 794px; padding: 40px; 
        background: #0f172a; color: white; 
        font-family: sans-serif;
      `;

      // Group items by day
      const byDay: Record<number, ExportItem[]> = {};
      items.forEach(item => {
        if (!byDay[item.day]) byDay[item.day] = [];
        byDay[item.day].push(item);
      });

      const days = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
      const tripStart = new Date(startDate);

      printEl.innerHTML = `
        <div style="border-bottom: 2px solid #7c3aed; padding-bottom: 24px; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #fff; margin: 0 0 8px 0;">✈️ ${tripName}</h1>
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">📍 ${destination} &nbsp;|&nbsp; 📅 ${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        ${days.map(day => {
          const dayNum = Number(day);
          const date = new Date(tripStart);
          date.setDate(date.getDate() + (dayNum - 1));
          return `
            <div style="margin-bottom: 28px; page-break-inside: avoid;">
              <h2 style="font-size: 18px; font-weight: bold; color: #a78bfa; margin: 0 0 12px 0; border-left: 4px solid #7c3aed; padding-left: 12px;">
                Day ${day} &mdash; ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              ${byDay[dayNum].map(item => `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #f1f5f9; font-size: 14px;">${item.title}</strong>
                    <span style="font-size: 11px; color: #64748b; background: #0f172a; padding: 2px 8px; border-radius: 4px;">${item.category}</span>
                  </div>
                  ${item.description ? `<p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0;">${item.description}</p>` : ""}
                </div>
              `).join("")}
            </div>
          `;
        }).join("")}
        <div style="border-top: 1px solid #334155; padding-top: 16px; margin-top: 32px; text-align: center; color: #475569; font-size: 11px;">
          Generated by WanderMatch &bull; ${new Date().toLocaleDateString()}
        </div>
      `;

      document.body.appendChild(printEl);

      const canvas = await html2canvas(printEl, {
        scale: 2,
        backgroundColor: "#0f172a",
        logging: false,
      });

      document.body.removeChild(printEl);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const pdfImgHeight = pageWidth / ratio;
      
      let position = 0;
      let remaining = pdfImgHeight;

      while (remaining > 0) {
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          -position,
          pageWidth,
          pdfImgHeight
        );
        remaining -= pageHeight;
        position += pageHeight;
        if (remaining > 0) pdf.addPage();
      }

      pdf.save(`${tripName.replace(/\s+/g, "_")}_itinerary.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleExportCalendar}
        variant="outline"
        size="sm"
        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <CalendarIcon className="w-4 h-4 mr-1.5" />
        .ics
      </Button>
      <Button
        onClick={handleExportPDF}
        disabled={isExportingPDF}
        variant="outline"
        size="sm"
        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <DownloadIcon className={`w-4 h-4 mr-1.5 ${isExportingPDF ? "animate-bounce" : ""}`} />
        {isExportingPDF ? "Saving..." : "PDF"}
      </Button>
    </div>
  );
}
